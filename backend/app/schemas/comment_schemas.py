# schemas/comment_schemas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CommentBase(BaseModel):
    post_id: int
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(BaseModel):
    comment_id: int
    user_id: int
    post_id: int
    content: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class InteractionBase(BaseModel):
    user_id: int
    interaction_type_id: int

class CommentInteractionCreate(InteractionBase):
    comment_id: int

class CommentInteractionResponse(CommentInteractionCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True