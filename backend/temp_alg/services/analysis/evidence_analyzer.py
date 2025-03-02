# services/analysis/evidence_analyzer.py
import httpx
import json
from typing import Dict, Any


class EvidenceAnalyzer:
    def __init__(self, api_key: str, api_url: str, model: str):
        self.api_key = api_key
        self.api_url = api_url
        self.model = model

    async def analyze(self, content: str) -> Dict[str, Any]:
        """
        Analyze content for evidence quality and factual accuracy
        """
        system_prompt = """
        You are an expert in evaluating evidence quality, factual accuracy, and information reliability.
        Your task is to analyze text for claims, supporting evidence, and information accuracy.

        For each claim identified, analyze:
        1. Whether it is supported by evidence
        2. The quality and reliability of that evidence
        3. Whether the evidence actually supports the claim made
        4. The verifiability of the claim

        In evaluating evidence, consider:
        - Source quality (academic, peer-reviewed, expert, news, anecdotal, etc.)
        - Recency and relevance
        - Logical connection to the claim
        - Potential for verification
        - Presence of data, statistics, or specific examples
        - Recognition of limitations or uncertainties

        Respond in JSON format with the following structure:
        {
            "evidence_score": (float between 0-1, where 0 means poor evidence and 1 means excellent evidence),
            "claims_analysis": [
                {
                    "claim": (the specific claim made),
                    "evidence_provided": (description of evidence provided for this claim),
                    "evidence_quality": (float between 0-1),
                    "verifiability": (float between 0-1),
                    "improvement_suggestion": (how the evidence could be improved)
                }
            ],
            "overall_assessment": {
                "supported_claims": (int - number of well-supported claims),
                "unsupported_claims": (int - number of poorly supported claims),
                "verifiable_information": (float between 0-1 - proportion of verifiable information)
            },
            "confidence": (float between 0-1)
        }
        """

        user_prompt = f"Analyze the following text for evidence quality and factual accuracy:\n\n{content}"

        try:
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
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.1,
                        "response_format": {"type": "json_object"}
                    },
                    timeout=30.0
                )

                if response.status_code != 200:
                    return self._get_fallback_response()

                result = response.json()
                return json.loads(result["choices"][0]["message"]["content"])

        except Exception as e:
            print(f"Error in evidence analysis: {str(e)}")
            return self._get_fallback_response()

    def _get_fallback_response(self) -> Dict[str, Any]:
        """Return a fallback response if the API call fails"""
        return {
            "evidence_score": 0.5,
            "claims_analysis": [],
            "overall_assessment": {
                "supported_claims": 0,
                "unsupported_claims": 0,
                "verifiable_information": 0.5
            },
            "confidence": 0.0
        }