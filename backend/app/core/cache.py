# app/core/cache.py
from redis import asyncio as aioredis
from typing import Optional
from app.core.config import settings

redis_client: Optional[aioredis.Redis] = None

async def init_redis():
    global redis_client
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        # Test connection
        await redis_client.ping()
        print("Redis connection established")
    except Exception as e:
        print(f"Failed to connect to Redis: {str(e)}")
        redis_client = None

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()

async def get_redis() -> Optional[aioredis.Redis]:
    if not redis_client:
        await init_redis()
    return redis_client