# app/core/RedisCache.py
from redis import asyncio as aioredis
from typing import Optional
from app.core.config import settings

redis_client: Optional[aioredis.Redis] = None


async def init_redis():
    global redis_client
    try:
        connection_kwargs = {
            'encoding': 'utf-8',
            'decode_responses': True,
            'socket_timeout': 5.0,
            'socket_connect_timeout': 5.0,
            'retry_on_timeout': True,
            'health_check_interval': 30
        }

        redis_client = await aioredis.from_url(
            settings.REDIS_URL,
            **connection_kwargs
        )

        # Test connection and clear stale data
        await redis_client.ping()
        # Add keys monitoring
        await redis_client.config_set('notify-keyspace-events', 'Ex')
        print("✅ Redis connection established and configured")

    except Exception as e:
        print(f"❌ Failed to connect to Redis: {str(e)}")
        redis_client = None

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()


async def get_redis() -> Optional[aioredis.Redis]:
    if not redis_client:
        await init_redis()
    return redis_client