# app/core/logger.py
import asyncio
import logging
import sys
from typing import Any
from functools import wraps
from time import time

# Create default logger instance
logger = logging.getLogger("app")
logger.setLevel(logging.INFO)

# Add handler if none exists
if not logger.handlers:
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)


def setup_logger(name: str) -> logging.Logger:
    """Setup a logger instance with the given name"""
    logger = logging.getLogger(f"app.{name}")

    if not logger.handlers:  # Prevent duplicate handlers
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)

        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name"""
    return setup_logger(name)


def log_execution_time(logger: logging.Logger):
    """Decorator to log function execution time"""

    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time()
            try:
                result = await func(*args, **kwargs)
                execution_time = time() - start_time
                logger.info(f"{func.__name__} executed in {execution_time:.2f}s")
                return result
            except Exception as e:
                execution_time = time() - start_time
                logger.error(f"{func.__name__} failed after {execution_time:.2f}s: {str(e)}")
                raise

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time()
            try:
                result = func(*args, **kwargs)
                execution_time = time() - start_time
                logger.info(f"{func.__name__} executed in {execution_time:.2f}s")
                return result
            except Exception as e:
                execution_time = time() - start_time
                logger.error(f"{func.__name__} failed after {execution_time:.2f}s: {str(e)}")
                raise

        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper

    return decorator


# Export the logger instance and functions
__all__ = ['logger', 'get_logger', 'setup_logger', 'log_execution_time']