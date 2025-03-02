# services/analysis/actionability_analyzer.py
import httpx
import json
from sqlalchemy.orm import Session
from typing import Dict, Any, List


class ActionabilityAnalyzer:
    def __init__(self, db: Session, api_key: str, api_url: str, model: str):
        self.db = db
        self.api_key = api_key
        self.api_url = api_url
        self.model = model

    async def analyze(self, content: str, post_id: int) -> Dict[str, Any]:
        """
        Analyze content for actionability and practical utility
        Combines LLM analysis with data about how often the post is used in action plans
        """
        # Get action plan usage data
        action_plan_data = self._get_action_plan_data(post_id)

        # Run LLM analysis
        llm_results = await self._analyze_with_llm(content)

        # Combine for final score
        final_results = self._combine_results(llm_results, action_plan_data)

        return final_results

    def _get_action_plan_data(self, post_id: int) -> Dict[str, Any]:
        """Get data about how this post is used in action plans"""
        # This would connect to your action plan feature
        # Example queries - modify based on your schema

        # How many times this post was saved to plans
        # saved_count = self.db.query(func.count(ActionPlanItem.plan_item_id)).filter(
        #     ActionPlanItem.post_id == post_id
        # ).scalar()

        # How many plans with this post were completed
        # completed_count = self.db.query(func.count(ActionPlan.plan_id)).join(
        #     ActionPlanItem, ActionPlan.plan_id == ActionPlanItem.plan_id
        # ).filter(
        #     ActionPlanItem.post_id == post_id,
        #     ActionPlan.status == 'completed'
        # ).scalar()

        # For demo purposes
        saved_count = 0
        completed_count = 0

        return {
            "saved_to_plans_count": saved_count,
            "completed_plans_count": completed_count,
            "completion_ratio": completed_count / max(1, saved_count)
        }

    async def _analyze_with_llm(self, content: str) -> Dict[str, Any]:
        """Analyze the content with LLM for actionability"""
        system_prompt = """
        You are an expert in evaluating the practical utility and actionability of content.
        Your task is to analyze text for how useful it would be for someone trying to take action or implement ideas.

        Evaluate the following aspects:
        1. Clarity of action steps - How clearly are actions defined?
        2. Specificity - How specific and detailed are the instructions?
        3. Feasibility - How realistic and achievable are the proposed actions?
        4. Resource requirements - What resources would be needed?
        5. Comprehensiveness - Does it cover all necessary steps or information?
        6. Obstacles addressed - Does it address potential challenges and solutions?

        Respond in JSON format with the following structure:
        {
            "actionability_score": (float between 0-1, where 0 means not actionable and 1 means highly actionable),
            "aspect_scores": {
                "clarity": (float between 0-1),
                "specificity": (float between 0-1),
                "feasibility": (float between 0-1),
                "comprehensiveness": (float between 0-1),
                "obstacle_awareness": (float between 0-1)
            },
            "action_items": [
                {
                    "description": (description of action item),
                    "clarity": (float between 0-1),
                    "resource_requirements": (description of resources needed)
                }
            ],
            "improvement_suggestions": (suggestions to make content more actionable),
            "confidence": (float between 0-1)
        }
        """

        user_prompt = f"Analyze the following text for actionability and practical utility:\n\n{content}"

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
            print(f"Error in actionability analysis: {str(e)}")
            return self._get_fallback_response()

    def _combine_results(self, llm_results: Dict[str, Any], action_plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Combine LLM analysis with action plan usage data"""
        # Base score from LLM
        actionability_score = llm_results.get("actionability_score", 0.5)

        # Adjust based on real-world usage in plans
        saved_count = action_plan_data.get("saved_to_plans_count", 0)
        completion_ratio = action_plan_data.get("completion_ratio", 0.0)

        # If post is used in many plans, boost score
        if saved_count > 10:
            actionability_score = min(1.0, actionability_score * 1.2)

        # If plans with this post are completed at high rate, boost score
        if completion_ratio > 0.7 and saved_count > 5:
            actionability_score = min(1.0, actionability_score * 1.1)

        # Combine all results
        final_results = {
            "actionability_score": actionability_score,
            "aspect_scores": llm_results.get("aspect_scores", {}),
            "action_items": llm_results.get("action_items", []),
            "improvement_suggestions": llm_results.get("improvement_suggestions", ""),
            "real_world_usage": {
                "saved_to_plans": saved_count,
                "completed_plans": action_plan_data.get("completed_plans_count", 0),
                "completion_ratio": completion_ratio
            },
            "confidence": llm_results.get("confidence", 0.0)
        }

        return final_results

    def _get_fallback_response(self) -> Dict[str, Any]:
        """Return a fallback response if the API call fails"""
        return {
            "actionability_score": 0.5,
            "aspect_scores": {
                "clarity": 0.5,
                "specificity": 0.5,
                "feasibility": 0.5,
                "comprehensiveness": 0.5,
                "obstacle_awareness": 0.5
            },
            "action_items": [],
            "improvement_suggestions": "",
            "confidence": 0.0
        }