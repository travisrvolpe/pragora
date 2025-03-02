# services/analysis/participation_analyzer.py
import json
import httpx
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.datamodels.interaction_datamodels import PostInteraction, InteractionType
from app.datamodels.post_datamodels import Post


class ParticipationAnalyzer:
    def __init__(self, db: Session, api_key: str, api_url: str, model: str):
        self.db = db
        self.api_key = api_key
        self.api_url = api_url
        self.model = model

    async def analyze(self, content: str, post_id: int, user_id: int) -> Dict[str, Any]:
        """
        Analyze participation for good faith vs bad faith indicators
        Combines LLM analysis with user reports and historical data
        """
        # Get report data from database
        report_data = self._get_report_data(post_id)

        # Get user's historical participation metrics
        user_history = self._get_user_history(user_id)

        # Run LLM analysis
        llm_results = await self._analyze_with_llm(content)

        # Combine all data sources for final score
        final_analysis = self._combine_analysis(llm_results, report_data, user_history)

        return final_analysis

    def _get_report_data(self, post_id: int) -> Dict[str, Any]:
        """Get report data for this post from the database"""
        # Query reports for this post
        reports = self.db.query(PostInteraction).filter(
            PostInteraction.post_id == post_id,
            PostInteraction.interaction_type_id == 5  # Assuming 5 is the report type
        ).all()

        if not reports:
            return {
                "report_count": 0,
                "report_reasons": [],
                "reported_by_trusted_users": 0
            }

        # Analyze report reasons if available
        report_reasons = []
        trusted_reporter_count = 0

        for report in reports:
            # Check if reporter is trusted (reputation > 50)
            reporter = self.db.query(User).options(
                joinedload(User.profile)
            ).filter(User.user_id == report.user_id).first()

            if reporter and reporter.profile and reporter.profile.reputation_score > 50:
                trusted_reporter_count += 1

            # Get report reason if available
            if hasattr(report, 'metadata') and report.metadata:
                if isinstance(report.metadata, str):
                    try:
                        metadata = json.loads(report.metadata)
                        if 'reason' in metadata:
                            report_reasons.append(metadata['reason'])
                    except:
                        pass
                elif isinstance(report.metadata, dict) and 'reason' in report.metadata:
                    report_reasons.append(report.metadata['reason'])

        return {
            "report_count": len(reports),
            "report_reasons": report_reasons,
            "reported_by_trusted_users": trusted_reporter_count
        }

    def _get_user_history(self, user_id: int) -> Dict[str, Any]:
        """Get historical data about user's participation"""
        # Get user's posts that have been reported
        reported_posts_count = self.db.query(Post).join(
            PostInteraction,
            Post.post_id == PostInteraction.post_id
        ).filter(
            Post.user_id == user_id,
            PostInteraction.interaction_type_id == 5  # Report type
        ).distinct(Post.post_id).count()

        # Get user's previous participation scores if stored
        # This would connect to a table that stores previous analysis results

        return {
            "reported_posts_ratio": reported_posts_count / max(1, self.db.query(Post).filter(
                Post.user_id == user_id).count()),
            "previous_bad_faith_score": 0.0  # Placeholder, would come from historical data
        }

    async def _analyze_with_llm(self, content: str) -> Dict[str, Any]:
        """Analyze the content with LLM for good/bad faith indicators"""
        system_prompt = """
        You are an expert in analyzing online communication for indicators of good faith versus bad faith participation.
        Your task is to analyze text for signs of trolling, honesty vs. dishonesty, respectfulness, empathy, and constructive engagement.

        Good faith indicators include:
        - Honesty and truthfulness
        - Respectful engagement with others' views
        - Empathy and consideration
        - Willingness to consider evidence
        - Constructive criticism
        - Charitable interpretation of others' arguments

        Bad faith indicators include:
        - Trolling or intentional provocation
        - Dishonesty or deliberate misrepresentation
        - Personal attacks or insults
        - Dismissiveness without engagement
        - Sealioning (pretending to ask sincere questions)
        - Deliberate misinterpretation of others' points

        Respond in JSON format with the following structure:
        {
            "good_faith_score": (float between 0-1, where 0 means bad faith and 1 means good faith),
            "indicators": {
                "honesty": (float between 0-1),
                "respectfulness": (float between 0-1),
                "empathy": (float between 0-1),
                "constructiveness": (float between 0-1)
            },
            "concerns": [
                {
                    "concern_type": (type of bad faith behavior),
                    "explanation": (brief explanation),
                    "severity": (float between 0-1),
                    "text_segment": (relevant text excerpt)
                }
            ],
            "confidence": (float between 0-1)
        }
        """

        user_prompt = f"Analyze the following text for good faith versus bad faith participation:\n\n{content}"

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
                    return {
                        "good_faith_score": 0.5,
                        "indicators": {
                            "honesty": 0.5,
                            "respectfulness": 0.5,
                            "empathy": 0.5,
                            "constructiveness": 0.5
                        },
                        "concerns": [],
                        "confidence": 0.0
                    }

                result = response.json()
                return json.loads(result["choices"][0]["message"]["content"])

        except Exception as e:
            print(f"Error in participation analysis: {str(e)}")
            return {
                "good_faith_score": 0.5,
                "indicators": {
                    "honesty": 0.5,
                    "respectfulness": 0.5,
                    "empathy": 0.5,
                    "constructiveness": 0.5
                },
                "concerns": [],
                "confidence": 0.0
            }

    def _combine_analysis(self, llm_results: Dict[str, Any], report_data: Dict[str, Any],
                          user_history: Dict[str, Any]) -> Dict[str, Any]:
        """Combine all data sources into a final analysis result"""
        # Base score from LLM
        good_faith_score = llm_results.get("good_faith_score", 0.5)

        # Adjust based on reports
        report_count = report_data.get("report_count", 0)
        trusted_reports = report_data.get("reported_by_trusted_users", 0)

        # Reports from trusted users have more weight
        if trusted_reports > 0:
            good_faith_score = max(0.0, good_faith_score - (trusted_reports * 0.05))

        # General reports have less weight
        if report_count > trusted_reports:
            good_faith_score = max(0.0, good_faith_score - ((report_count - trusted_reports) * 0.02))

        # Consider user history
        reported_ratio = user_history.get("reported_posts_ratio", 0.0)
        if reported_ratio > 0.2:  # If more than 20% of user's posts are reported
            good_faith_score = max(0.0, good_faith_score - (reported_ratio * 0.1))

        final_results = {
            "good_faith_score": good_faith_score,
            "indicators": llm_results.get("indicators", {}),
            "concerns": llm_results.get("concerns", []),
            "report_data": {
                "report_count": report_count,
                "trusted_reports": trusted_reports
            },
            "user_history": {
                "reported_posts_ratio": reported_ratio,
            },
            "confidence": llm_results.get("confidence", 0.0)
        }

        return final_results