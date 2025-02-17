# backend/app/schemas/comment_schemas.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Literal
from datetime import datetime
from .interaction_schemas import InteractionBase

def get_default_interaction_state() -> Dict[str, bool]:
    return {
        "like": False,
        "dislike": False,
        "report": False
    }

class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    post_id: int
    parent_comment_id: Optional[int] = None

class CommentCreate(CommentBase):
    pass

class CommentInteractionCreate(InteractionBase):
    comment_id: int
    target_type: Literal["comment"] = "comment"

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    avatar_img: Optional[str] = None
    reputation_score: Optional[int] = None
    expertise_area: Optional[str] = None
    credentials: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class CommentMetrics(BaseModel):
    like_count: int = 0
    dislike_count: int = 0
    reply_count: int = 0
    report_count: int = 0

    class Config:
        from_attributes = True

class CommentResponse(BaseModel):
    comment_id: int
    user_id: int
    post_id: int
    content: str
    parent_comment_id: Optional[int]
    path: str
    depth: int
    root_comment_id: Optional[int]

    # User information
    user: UserResponse
    username: str
    avatar_img: Optional[str]
    reputation_score: Optional[int]

    # Metrics
    metrics: CommentMetrics

    # Interaction state
    interaction_state: Dict[str, bool]

    # Status and timestamps
    is_edited: bool
    is_deleted: bool
    created_at: datetime
    updated_at: Optional[datetime]
    last_activity: datetime
    active_viewers: int

    # Optional fields for thread views
    replies: Optional[List['CommentResponse']] = None

    model_config = {
        "from_attributes": True
    }

    def __init__(self, **data):
        if 'interaction_state' not in data:
            data['interaction_state'] = get_default_interaction_state()
        super().__init__(**data)