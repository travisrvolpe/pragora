# services/analysis/fallacy_detector.py
import os
import json
import httpx
from typing import Dict, Any


class FallacyDetector:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.api_url = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
        self.model = os.getenv("LLM_MODEL", "gpt-4")

    async def analyze(self, content: str) -> Dict[str, Any]:
        """
        Analyze content for logical fallacies using LLM
        """
        system_prompt = """
        You are an expert in logical reasoning, argumentation, and fallacy detection. 
        Your task is to analyze text for logical fallacies with high precision.

        For each detected fallacy, identify:
        1. The specific type of fallacy
        2. The text segment containing it
        3. A clear explanation of why it's fallacious
        4. The severity of the fallacy (how much it undermines the argument)

        Common fallacies include but are not limited to:
        - Ad Hominem (attacking the person not the argument)
        - Straw Man (misrepresenting someone's argument)
        - Appeal to Authority (using authority rather than evidence)
        - False Dichotomy (presenting only two options when more exist)
        - Slippery Slope (arguing one small step leads to extreme consequences)
        - Circular Reasoning (using the conclusion as a premise)
        - Hasty Generalization (drawing conclusions from insufficient evidence)
        - Appeal to Emotion (using emotions rather than logic)
        - Red Herring (introducing irrelevant issues to distract)
        - No True Scotsman (using arbitrary redefinitions to maintain an argument)

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
            "total_fallacies": (integer count of unique fallacies detected),
            "confidence": (float between 0-1 representing your confidence in this analysis)
        }
        """

        user_prompt = f"Analyze the following text for logical fallacies:\n\n{content}"

        try:
            # Make API call to LLM
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
                        "temperature": 0.1,  # Keep temperature low for consistent analysis
                        "response_format": {"type": "json_object"}
                    },
                    timeout=30.0
                )

                if response.status_code != 200:
                    print(f"LLM API error: {response.status_code} - {response.text}")
                    return self._get_fallback_response()

                result = response.json()
                return json.loads(result["choices"][0]["message"]["content"])

        except Exception as e:
            print(f"Error in fallacy detection: {str(e)}")
            return self._get_fallback_response()

    def _get_fallback_response(self) -> Dict[str, Any]:
        """Return a fallback response if the API call fails"""
        return {
            "fallacy_score": 0.0,
            "fallacies_detected": [],
            "total_fallacies": 0,
            "confidence": 0.0
        }