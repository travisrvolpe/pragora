# schemas/badge_schemas.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# Badge Schemas
class BadgeCategoryCreate(BaseModel):
    badge_name: str
    badge_description: Optional[str] = None
    is_merit: bool = True


class BadgeCategoryResponse(BaseModel):
    badge_category_id: int
    badge_name: str
    badge_description: Optional[str]
    is_merit: bool

    class Config:
        from_attributes = True


class BadgeCreate(BaseModel):
    badge_category_id: int
    badge_name: str
    badge_description: Optional[str] = None
    badge_icon_url: Optional[str] = None
    badge_threshold: int
    is_merit: bool = True


class BadgeResponse(BaseModel):
    badge_id: int
    badge_category_id: int
    badge_name: str
    badge_description: Optional[str]
    badge_icon_url: Optional[str]
    badge_threshold: int
    is_merit: bool
    category_name: Optional[str] = None  # Include the category name for convenience

    class Config:
        from_attributes = True


class UserBadgeCreate(BaseModel):
    user_id: int
    badge_id: int
    badge_current_points: int = 0
    badge_earned: bool = False


class UserBadgeUpdate(BaseModel):
    badge_current_points: Optional[int] = None
    badge_earned: Optional[bool] = None
    badge_earned_at: Optional[datetime] = None


class UserBadgeResponse(BaseModel):
    user_badge_id: int
    user_id: int
    badge_id: int
    badge_earned_at: Optional[datetime] = None
    badge_current_points: int
    badge_earned: bool
    badge_first_progress_at: datetime
    badge_last_updated: datetime

    # Extra fields for convenience
    badge_name: Optional[str] = None
    badge_description: Optional[str] = None
    badge_icon_url: Optional[str] = None
    badge_threshold: Optional[int] = None
    is_merit: Optional[bool] = None
    badge_category: Optional[str] = None

    # Calculated fields
    progress_percentage: Optional[float] = None

    class Config:
        from_attributes = True

    @validator('progress_percentage', pre=True, always=True)
    def calculate_progress(cls, v, values):
        if 'badge_current_points' in values and 'badge_threshold' in values and values['badge_threshold']:
            return min(100.0, (values['badge_current_points'] / values['badge_threshold']) * 100)
        return 0.0