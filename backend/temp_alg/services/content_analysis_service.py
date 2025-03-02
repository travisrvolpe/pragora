# services/content_analysis_service.py
from fastapi import Depends
from sqlalchemy.orm import Session
from app.datamodels.post_datamodels import Post, PostAnalysis
from app.utils.database_utils import get_db

# services/content_analysis_service.py
from app.services.llm_service import LLMService, AnalysisRequest


class ContentAnalysisService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.llm_service = LLMService()

    async def analyze_post(self, post_id: int):
        """Run comprehensive analysis on a post"""
        post = self.db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            return None

        # Get or create analysis record
        analysis = self.db.query(PostAnalysis).filter(
            PostAnalysis.post_id == post_id
        ).first()

        if not analysis:
            analysis = PostAnalysis(post_id=post_id)
            self.db.add(analysis)

        # Run analysis using LLM service
        fallacy_results = await self.llm_service.analyze_content(
            AnalysisRequest(content=post.content, analysis_type="fallacy")
        )

        evidence_results = await self.llm_service.analyze_content(
            AnalysisRequest(content=post.content, analysis_type="evidence")
        )

        bias_results = await self.llm_service.analyze_content(
            AnalysisRequest(content=post.content, analysis_type="bias")
        )

        # Update analysis record with results
        analysis.fallacy_score = fallacy_results.get("overall_score", 0.5)
        analysis.fallacy_types = fallacy_results.get("fallacies_detected", [])

        analysis.evidence_score = evidence_results.get("overall_score", 0.5)
        analysis.evidence_types = evidence_results.get("claims_analysis", [])

        analysis.bias_score = bias_results.get("overall_score", 0.5)
        analysis.bias_types = bias_results.get("bias_detected", [])

        # Calculate confidence based on LLM confidence scores
        analysis.confidence_score = (
                                            fallacy_results.get("confidence", 0) +
                                            evidence_results.get("confidence", 0) +
                                            bias_results.get("confidence", 0)
                                    ) / 3.0

        # Save results
        self.db.commit()
        return analysis


# services/content_analysis_service.py - modify analyze_post method
async def analyze_post(self, post_id: int):
    """Run comprehensive analysis on a post"""
    # ... existing code

    # Get badge service
    badge_service = BadgeService(self.db)

    # Award merit points for good logical reasoning
    if analysis.evidence_score > 0.7:
        # High evidence quality gets merit points
        await badge_service.award_points(
            post.user_id,
            "Evidence Quality",
            1,  # 1 point per high-quality evidence instance
            is_merit=True
        )

    # Award demerit points for fallacies
    if analysis.fallacy_score > 0.5 and analysis.fallacy_types:
        # Fallacy detected gets demerit points
        await badge_service.award_points(
            post.user_id,
            "Logical Fallacies",
            len(analysis.fallacy_types),  # 1 point per fallacy type detected
            is_merit=False
        )

    # Similar logic for other categories

    # Return complete analysis
    return analysis


# Example tiered approach in content_analysis_service.py
async def analyze_post(self, post_id: int):
    post = self.db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        return None

    # Quick screening with rule-based approach
    needs_llm_analysis = self._quick_screen(post.content)

    if not needs_llm_analysis:
        # Simple analysis results
        analysis = PostAnalysis(
            post_id=post_id,
            fallacy_score=0.1,
            evidence_score=0.5,
            bias_score=0.2,
            confidence_score=0.3
        )
        self.db.add(analysis)
        self.db.commit()
        return analysis

    # If content needs deeper analysis, proceed with LLM API
    # ... rest of the LLM analysis code


async def _analyze_fallacies(self, content: str) -> dict:
    """
    Detect logical fallacies in content using LLM API
    Returns dict with fallacy_score and detected fallacies
    """
    try:
        # Construct a targeted prompt for fallacy detection
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

        user_prompt = f"Analyze the following text for logical fallacies:\n\n{content}"

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
                    "temperature": 0.1,  # Low temperature for consistent analysis
                    "response_format": {"type": "json_object"}
                },
                timeout=30.0
            )

            if response.status_code != 200:
                print(f"LLM API error: {response.text}")
                return {
                    "fallacy_score": 0.0,
                    "fallacies_detected": [],
                    "confidence": 0.0
                }

            result = response.json()
            analysis = json.loads(result["choices"][0]["message"]["content"])

            # Process the LLM response
            return {
                "fallacy_score": analysis.get("fallacy_score", 0.0),
                "fallacies_detected": analysis.get("fallacies_detected", []),
                "confidence": analysis.get("confidence", 0.0)
            }

    except Exception as e:
        print(f"Error in fallacy analysis: {str(e)}")
        return {
            "fallacy_score": 0.0,
            "fallacies_detected": [],
            "confidence": 0.0
        }


# services/content_analysis_service.py
from app.services.llm_client import LLMClient
from app.datamodels.post_datamodels import Post, PostAnalysis
from app.services.badge_service import BadgeService
from sqlalchemy.orm import Session
from fastapi import Depends
from app.utils.database_utils import get_db


class ContentAnalysisService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
        self.llm_client = LLMClient()

    async def analyze_post(self, post_id: int):
        """Run comprehensive analysis on a post"""
        post = self.db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            return None

        # Get or create analysis record
        analysis = self.db.query(PostAnalysis).filter(
            PostAnalysis.post_id == post_id
        ).first()

        if not analysis:
            analysis = PostAnalysis(post_id=post_id)
            self.db.add(analysis)

        # Run fallacy analysis using LLM
        fallacy_results = await self.llm_client.analyze_fallacies(post.content)

        # Update analysis record
        analysis.fallacy_score = fallacy_results.get("fallacy_score", 0.0)
        analysis.fallacy_types = fallacy_results.get("fallacies_detected", [])

        # Run evidence analysis
        evidence_results = await self.llm_client.analyze_evidence(post.content)
        analysis.evidence_score = evidence_results.get("evidence_score", 0.0)
        analysis.evidence_types = evidence_results.get("claims", [])

        # Run bias analysis
        bias_results = await self.llm_client.analyze_bias(post.content)
        analysis.bias_score = bias_results.get("bias_score", 0.0)
        analysis.bias_types = bias_results.get("biases_detected", [])

        # Update other scores
        analysis.confidence_score = (
                                            fallacy_results.get("confidence", 0.0) +
                                            evidence_results.get("confidence", 0.0) +
                                            bias_results.get("confidence", 0.0)
                                    ) / 3.0

        # Save to database
        self.db.commit()

        # Award badge points based on analysis
        await self._award_badge_points(post.user_id, fallacy_results, evidence_results, bias_results)

        return analysis

    async def _award_badge_points(self, user_id: int, fallacy_results: dict, evidence_results: dict,
                                  bias_results: dict):
        """Award merit/demerit points based on analysis results"""
        badge_service = BadgeService(self.db)

        # Award demerit points for fallacies
        fallacies_detected = fallacy_results.get("fallacies_detected", [])
        if fallacies_detected and len(fallacies_detected) > 0:
            # Award 1 point per fallacy type detected
            await badge_service.award_points(
                user_id,
                "Logical Fallacies",
                len(fallacies_detected),
                is_merit=False
            )

        # Award merit points for good evidence
        if evidence_results.get("evidence_score", 0) > 0.7:
            await badge_service.award_points(
                user_id,
                "Evidence Quality",
                1,  # Award 1 point for high-quality evidence
                is_merit=True
            )

        # Award demerit points for bias
        biases_detected = bias_results.get("biases_detected", [])
        if biases_detected and len(biases_detected) > 0:
            await badge_service.award_points(
                user_id,
                "Bias",
                len(biases_detected),
                is_merit=False
            )