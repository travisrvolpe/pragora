# utils/task_manager.py
import asyncio
from fastapi import BackgroundTasks
from app.services.content_analysis_service import ContentAnalysisService
from app.services.user_merit_service import UserMeritService


class AnalysisTaskManager:
    @staticmethod
    async def schedule_post_analysis(background_tasks: BackgroundTasks, post_id: int):
        """Schedule a post for analysis"""
        background_tasks.add_task(
            AnalysisTaskManager._run_post_analysis,
            post_id
        )

    @staticmethod
    async def _run_post_analysis(post_id: int):
        """Run the full analysis pipeline on a post"""
        analysis_service = ContentAnalysisService()
        await analysis_service.analyze_post(post_id)

        # After post analysis is complete, update user merit
        # Get user_id from post
        db = get_db()
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if post:
            merit_service = UserMeritService()
            await merit_service.update_user_merit(post.user_id)