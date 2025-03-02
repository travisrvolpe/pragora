# services/llm_client.py
import os
import json
import httpx
from typing import Dict, Any


class LLMClient:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")  # Use your preferred LLM provider
        self.api_url = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
        self.model = os.getenv("LLM_MODEL", "gpt-4")

    async def analyze_fallacies(self, content: str) -> Dict[str, Any]:
        """
        Analyze content for logical fallacies using LLM
        """
        system_prompt = """
        You are an expert in logical reasoning and fallacy detection. Analyze the text for logical fallacies.
        Identify specific fallacy types (e.g., ad hominem, straw man, false dichotomy, appeal to authority, etc.).

        Respond in JSON format with the following structure:
        {
            "fallacy_score": (float between 0-1, where 0 means no fallacies and 1 means severe fallacies),
            "fallacies_detected": [
                {
                    "fallacy_type": (name of the fallacy),
                    "explanation": (brief explanation of why this is a fallacy),
                    "severity": (float between 0-1),
                    "text_segment": (the specific part of the text containing the fallacy)
                }
            ],
            "confidence": (float between 0-1 representing your confidence in this analysis)
        }
        """

        return await self._call_llm_api(system_prompt, content)

    async def analyze_evidence(self, content: str) -> Dict[str, Any]:
        """
        Analyze content for evidence quality using LLM
        """
        system_prompt = """
        You are an expert in evaluating evidence quality and factual claims. Analyze the text for evidence quality.

        Respond in JSON format with the following structure:
        {
            "evidence_score": (float between 0-1, where 0 means poor evidence and 1 means excellent evidence),
            "claims": [
                {
                    "claim": (the specific claim made),
                    "evidence_provided": (description of evidence provided for this claim),
                    "evidence_quality": (float between 0-1),
                    "improvement_suggestion": (how the evidence could be improved)
                }
            ],
            "confidence": (float between 0-1 representing your confidence in this analysis)
        }
        """

        return await self._call_llm_api(system_prompt, content)

    async def analyze_bias(self, content: str) -> Dict[str, Any]:
        """
        Analyze content for bias using LLM
        """
        system_prompt = """
        You are an expert in identifying bias in arguments and content. Analyze the text for different types of bias.

        Respond in JSON format with the following structure:
        {
            "bias_score": (float between 0-1, where 0 means unbiased and 1 means heavily biased),
            "biases_detected": [
                {
                    "bias_type": (name of the bias),
                    "explanation": (brief explanation of why this indicates bias),
                    "severity": (float between 0-1),
                    "text_segment": (the specific part of the text showing this bias)
                }
            ],
            "confidence": (float between 0-1 representing your confidence in this analysis)
        }
        """

        return await self._call_llm_api(system_prompt, content)

    async def _call_llm_api(self, system_prompt: str, content: str) -> Dict[str, Any]:
        """
        Make the actual API call to the LLM
        """
        try:
            user_prompt = f"Analyze the following text:\n\n{content}"

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
                    print(f"LLM API error: {response.status_code} - {response.text}")
                    return {"error": "API call failed", "confidence": 0.0}

                result = response.json()
                return json.loads(result["choices"][0]["message"]["content"])

        except Exception as e:
            print(f"Error in LLM API call: {str(e)}")
            return {"error": str(e), "confidence": 0.0}