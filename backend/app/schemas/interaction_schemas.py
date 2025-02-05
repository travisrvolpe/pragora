# app/schemas/interaction_schemas.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal
from datetime import datetime

class InteractionBase(BaseModel):
    user_id: int
    interaction_type_id: int
    metadata: Optional[Dict[str, Any]] = None
    target_type: Literal["post", "comment"]

class PostInteractionCreate(InteractionBase):
    post_id: int
    target_type: Literal["post"] = "post"

class CommentInteractionCreate(InteractionBase):
    comment_id: int
    target_type: Literal["comment"] = "comment"

class InteractionResponse(BaseModel):
    interaction_id: int
    user_id: int
    interaction_type_id: int
    target_type: str
    created_at: datetime
    metadata: Optional[Dict[str, Any]]

    class Config:
        orm_mode = True

class InteractionMetrics(BaseModel):
    like_count: int = 0
    dislike_count: int = 0
    save_count: int = 0
    share_count: int = 0
    report_count: int = 0

    class Config:
        orm_mode = True