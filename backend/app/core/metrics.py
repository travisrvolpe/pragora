# app/core/metrics.py
#import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from app.cache import RedisCache
from app.core.exceptions import CacheError
from app.core.logger import get_logger

logger = get_logger(__name__)
#logger = logging.getLogger(__name__)


class MetricsCollector:
    def __init__(self, cache: RedisCache):
        self.cache = cache
        self.metrics_prefix = "metrics:"
        self.aggregation_window = timedelta(minutes=5)

    async def record_interaction(
            self,
            post_id: int,
            user_id: int,
            interaction_type: str,
            action: str,
            metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Record an interaction metric

        Args:
            post_id: ID of the post
            user_id: ID of the user
            interaction_type: Type of interaction (like, dislike, etc.)
            action: Action taken (add or remove)
            metadata: Additional metadata about the interaction
        """
        try:
            timestamp = datetime.utcnow().isoformat()

            # Create metric data
            metric_data = {
                "timestamp": timestamp,
                "post_id": post_id,
                "user_id": user_id,
                "interaction_type": interaction_type,
                "action": action,
                "metadata": metadata or {}
            }

            # Store raw metric
            metric_key = f"{self.metrics_prefix}raw:{post_id}:{timestamp}"
            await self.cache.set(metric_key, metric_data, expire=86400)  # 24 hour retention

            # Update aggregated counts
            await self._update_aggregated_counts(post_id, interaction_type, action)

            # Update user interaction history
            await self._update_user_history(user_id, post_id, interaction_type, action)

        except Exception as e:
            logger.error(f"Error recording metric: {str(e)}")
            # Don't raise - metrics should not block main functionality

    async def _update_aggregated_counts(
            self,
            post_id: int,
            interaction_type: str,
            action: str
    ) -> None:
        """Update aggregated interaction counts"""
        try:
            counts_key = f"{self.metrics_prefix}counts:post:{post_id}"
            current_counts = await self.cache.get(counts_key) or {}

            # Update counts based on action
            if action == "add":
                current_counts[interaction_type] = current_counts.get(interaction_type, 0) + 1
            elif action == "remove":
                current_counts[interaction_type] = max(0, current_counts.get(interaction_type, 0) - 1)

            await self.cache.set(counts_key, current_counts)

        except Exception as e:
            logger.error(f"Error updating aggregated counts: {str(e)}")

    async def _update_user_history(
            self,
            user_id: int,
            post_id: int,
            interaction_type: str,
            action: str
    ) -> None:
        """Update user interaction history"""
        try:
            history_key = f"{self.metrics_prefix}user:{user_id}:history"
            current_history = await self.cache.get(history_key) or []

            # Add new interaction to history
            current_history.append({
                "timestamp": datetime.utcnow().isoformat(),
                "post_id": post_id,
                "interaction_type": interaction_type,
                "action": action
            })

            # Keep only last 100 interactions
            if len(current_history) > 100:
                current_history = current_history[-100:]

            await self.cache.set(history_key, current_history, expire=604800)  # 7 day retention

        except Exception as e:
            logger.error(f"Error updating user history: {str(e)}")

    async def get_post_metrics(
            self,
            post_id: int,
            time_window: Optional[timedelta] = None
    ) -> Dict[str, Any]:
        """
        Get aggregated metrics for a post

        Args:
            post_id: ID of the post
            time_window: Optional time window for metrics (default: all time)

        Returns:
            Dict containing aggregated metrics
        """
        try:
            counts_key = f"{self.metrics_prefix}counts:post:{post_id}"
            counts = await self.cache.get(counts_key) or {}

            return {
                "interaction_counts": counts,
                "total_interactions": sum(counts.values()),
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error getting post metrics: {str(e)}")
            return {}

    async def get_user_interaction_history(
            self,
            user_id: int,
            limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get recent interaction history for a user"""
        try:
            history_key = f"{self.metrics_prefix}user:{user_id}:history"
            #await self.cache.set(history_key, current_history, expire=604800)  # 7 day retention?
            history = await self.cache.get(history_key) or []
            return history[:limit]

        except Exception as e:
            logger.error(f"Error getting user history: {str(e)}")
            return []


# Singleton instance
_metrics_collector: Optional[MetricsCollector] = None


def get_metrics_collector(cache: RedisCache) -> MetricsCollector:
    """Get or create MetricsCollector instance"""
    global _metrics_collector
    if _metrics_collector is None:
        _metrics_collector = MetricsCollector(cache)
    return _metrics_collector