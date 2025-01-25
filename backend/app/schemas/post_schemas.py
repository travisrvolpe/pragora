# schemas/post_schemas.py
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime


# Post schemas
class PostBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=255)
    content: str = Field(..., min_length=1)
    post_type_id: int
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    custom_subcategory: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = None
    caption: Optional[str] = None
    video_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

    @validator('subcategory_id')
    def validate_subcategory(cls, v, values):
        if v and not values.get('category_id'):
            raise ValueError('Cannot have subcategory without category')
        return v

class PostCreate(PostBase):
    pass

class PostUpdate(PostBase):
    pass

class PostResponse(BaseModel):
    post_id: int
    user_id: int
    title: Optional[str]
    subtitle: Optional[str]
    content: str
    image_url: Optional[str] = None
    caption: Optional[str] = None
    video_url: Optional[str] = None
    post_type_id: int
    category_id: Optional[int]
    subcategory_id: Optional[int]
    custom_subcategory: Optional[str]
    tags: List[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Interaction schemas
class InteractionBase(BaseModel):
    user_id: int
    interaction_type_id: int

class PostInteractionCreate(InteractionBase):
    post_id: int

class PostInteractionResponse(PostInteractionCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True