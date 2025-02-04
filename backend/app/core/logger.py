# app/core/logging.py
import logging
import sys
from typing import Any

# Create logger
logger = logging.getLogger("app")
logger.setLevel(logging.INFO)

# Create console handler with a higher log level
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# Create formatter and add it to the handler
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
console_handler.setFormatter(formatter)

# Add the handler to the logger
logger.addHandler(console_handler)

def get_logger(name: str) -> Any:
    """Get a logger instance with the given name"""
    return logging.getLogger(f"app.{name}")