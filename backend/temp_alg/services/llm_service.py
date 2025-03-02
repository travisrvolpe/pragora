# services/llm_service.py
import os
import json
import httpx
from typing import Dict, Any, List, Optional
from pydantic import BaseModel


class AnalysisRequest(BaseModel):
    content: str
    analysis_type: str  # fallacy, evidence, bias, etc.
    context: Optional[Dict] = None


class LLMService:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY")
        self.api_url = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
        self.model = os.getenv("LLM_MODEL", "gpt-4")

    async def analyze_content(self, request: AnalysisRequest) -> Dict[str, Any]:
        """Send content to LLM API for analysis"""
        try:
            # Construct prompt based on analysis type
            prompt = self._construct_prompt(request)

            # Call LLM API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": self._get_system_prompt(request.analysis_type)},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.2,  # Lower temperature for more consistent analysis
                        "response_format": {"type": "json_object"}
                    },
                    timeout=30.0
                )

                if response.status_code != 200:
                    print(f"LLM API error: {response.text}")
                    return self._get_fallback_response(request.analysis_type)

                result = response.json()
                # Parse the content from the response
                llm_result = json.loads(result["choices"][0]["message"]["content"])
                return llm_result

        except Exception as e:
            print(f"Error in LLM analysis: {str(e)}")
            return self._get_fallback_response(request.analysis_type)

    def _construct_prompt(self, request: AnalysisRequest) -> str:
        """Construct appropriate prompt based on analysis type"""
        if request.analysis_type == "fallacy":
            return (
                f"Analyze the following content for logical fallacies. "
                f"Identify specific fallacy types, their severity (0-1 scale), and explanation. "
                f"Content: {request.content}"
            )
        elif request.analysis_type == "evidence":
            return (
                f"Analyze the following content for evidence quality. "
                f"Evaluate claims, sources cited, and overall evidence strength (0-1 scale). "
                f"Content: {request.content}"
            )
        elif request.analysis_type == "bias":
            return (
                f"Analyze the following content for potential bias. "
                f"Identify bias types, their severity (0-1 scale), and explanation. "
                f"Content: {request.content}"
            )
        # Add other analysis types as needed

    def _get_system_prompt(self, analysis_type: str) -> str:
        """Get system prompt for specific analysis type"""
        base_prompt = "You are an expert content analyzer specialized in "

        if analysis_type == "fallacy":
            return base_prompt + "identifying logical fallacies. Respond in JSON format with fields: overall_score (0-1), fallacies_detected (array of {type, severity, explanation}), confidence (0-1)."
        elif analysis_type == "evidence":
            return base_prompt + "evaluating evidence quality. Respond in JSON format with fields: overall_score (0-1), claims_analysis (array of {claim, evidence_quality, explanation}), sources_quality (0-1), confidence (0-1)."
        # Add other analysis types

        return base_prompt + "content analysis."

    def _get_fallback_response(self, analysis_type: str) -> Dict[str, Any]:
        """Return fallback response if API call fails"""
        if analysis_type == "fallacy":
            return {
                "overall_score": 0.5,
                "fallacies_detected": [],
                "confidence": 0.0
            }
        elif analysis_type == "evidence":
            return {
                "overall_score": 0.5,
                "claims_analysis": [],
                "sources_quality": 0.5,
                "confidence": 0.0
            }
        # Add other fallback responses

        return {"error": "Analysis failed", "confidence": 0.0}