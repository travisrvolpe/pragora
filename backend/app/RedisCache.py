import json
from typing import Any, Optional
import redis.asyncio as redis
from app.core.config import settings

class RedisCache:
    def __init__(self):
        # Use the configuration's Redis URL
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
    #def __init__(self, redis_url: str = "redis://localhost:6379"):
    #    self.redis = redis.from_url(redis_url, decode_responses=True)

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = await self.redis.get(key)
            return json.loads(value) if value else None
        except Exception as e:
            print(f"Cache get error: {str(e)}")
            return None

    async def set(self, key: str, value: Any, expire: int = 300) -> bool:
        """Set value in cache with expiration in seconds"""
        try:
            await self.redis.set(
                key,
                json.dumps(value),
                ex=expire
            )
            return True
        except Exception as e:
            print(f"Cache set error: {str(e)}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            print(f"Cache delete error: {str(e)}")
            return False

    async def clear(self) -> bool:
        """Clear all cache"""
        try:
            await self.redis.flushdb()
            return True
        except Exception as e:
            print(f"Cache clear error: {str(e)}")
            return False

# Cache dependency
_cache_instance = None

def get_cache():
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = RedisCache()
    return _cache_instance