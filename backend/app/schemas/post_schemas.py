# schemas/post_schemas.py
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Dict
from datetime import datetime

# Post schemas
class Post(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    subtitle: Optional[str] = Field(None, max_length=255)
    content: str = Field(..., min_length=1)
    summary: Optional[str] = None
    post_type_id: int
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    custom_subcategory: Optional[str] = None

    # Media fields
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    video_metadata: Optional[Dict] = None
    audio_url: Optional[str] = None
    document_url: Optional[str] = None
    embedded_content: Optional[Dict] = None
    link_preview: Optional[Dict] = None

    # Aggregated Interaction Metrics
    like_count: int = 0
    dislike_count: int = 0
    save_count: int = 0
    share_count: int = 0
    comment_count: int = 0
    report_count: int = 0

    # Post metadata
    visibility: Optional[str] = "public"
    is_pinned: Optional[bool] = False
    is_draft: Optional[bool] = False
    parent_post_id: Optional[int] = None
    edit_history: Optional[Dict] = None

    tags: List[str]

    @classmethod
    @model_validator(mode='before')
    def set_defaults(cls, values):
        if not isinstance(values, dict):
            return values
        if 'tags' not in values:
            values['tags'] = []
        return values

    @classmethod
    @field_validator('subcategory_id')
    def validate_subcategory(cls, v, values):
        if v and not values.get('category_id'):
            raise ValueError('Cannot have subcategory without category')
        return v

    @classmethod
    @field_validator('post_type_id')
    def validate_post_type(cls, value):
        if value not in [1, 2, 3]:  # Replace with dynamic values from DB in production
            raise ValueError('Invalid post type')
        return value


class PostCreate(BaseModel):
    content: str
    post_type_id: int
    title: Optional[str] = None
    subtitle: Optional[str] = None
    summary: Optional[str] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None
    custom_subcategory: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    video_metadata: Optional[Dict] = None
    audio_url: Optional[str] = None
    document_url: Optional[str] = None
    embedded_content: Optional[Dict] = None
    link_preview: Optional[Dict] = None
    visibility: Optional[str] = "public"
    is_pinned: Optional[bool] = False
    is_draft: Optional[bool] = False
    parent_post_id: Optional[int] = None
    tags: List[str]

    @classmethod
    @model_validator(mode='before')
    def set_defaults(cls, values):
        if not isinstance(values, dict):
            return values
        if 'tags' not in values:
            values['tags'] = []
        return values

    @classmethod
    @field_validator('content')
    def validate_content(cls, value):
        if not value or not value.strip():
            raise ValueError('Content cannot be empty')
        return value.strip()

    @classmethod
    @field_validator('post_type_id')
    def validate_post_type(cls, value):
        if not isinstance(value, int):
            try:
                value = int(value)
            except (TypeError, ValueError):
                raise ValueError('post_type_id must be an integer')

        if value not in [1, 2, 3]:
            raise ValueError(f'Invalid post type: {value}. Must be one of [1, 2, 3]')
        return value

    class Config:
        extra = "allow"

class PostUpdate(Post):
    pass


class PostResponse(BaseModel):
    post_id: int
    user_id: int
    username: str  # From UserProfile
    avatar_img: Optional[str]  # From UserProfile
    reputation_score: int  # From UserProfile
    reputation_cat: str  # From UserProfile
    expertise_area: Optional[str]  # From UserProfile
    worldview_ai: Optional[str]  # From UserProfile

    title: Optional[str]
    subtitle: Optional[str]
    content: str
    summary: Optional[str]
    image_url: Optional[str]
    images: Optional[List[str]]
    video_url: Optional[str]
    video_metadata: Optional[Dict]
    audio_url: Optional[str]
    document_url: Optional[str]
    embedded_content: Optional[Dict]
    link_preview: Optional[Dict]

    post_type_id: int
    category_id: Optional[int]
    subcategory_id: Optional[int]
    custom_subcategory: Optional[str]

    visibility: str
    is_pinned: bool
    is_draft: bool
    parent_post_id: Optional[int]
    edit_history: Optional[Dict]

    tags: List[str]
    status: str
    created_at: datetime
    updated_at: datetime

    # Interaction metrics

    like_count: int = 0
    dislike_count: int = 0
    save_count: int = 0
    share_count: int = 0
    comment_count: int = 0
    report_count: int = 0

    # Engagement metrics
    view_count: Optional[int]
    unique_viewers: Optional[int]
    avg_view_duration: Optional[float]
    engagement_score: Optional[float]
    quality_score: Optional[float]

    # Fields for tracking user interactions
    like: bool = False
    dislike: bool = False
    share: bool = False
    report: bool = False
    comment: bool = False
    reply: bool = False

    class Config:
        from_attributes = True

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
        from_attributes = True
# should this be plural?
class PostMetricsUpdate(BaseModel):
    like_count: Optional[int] = Field(default=0)
    dislike_count: Optional[int] = Field(default=0)
    save_count: Optional[int] = Field(default=0)
    share_count: Optional[int] = Field(default=0)
    comment_count: Optional[int] = Field(default=0)
    report_count: Optional[int] = Field(default=0)

# Additional schemas for new features
class PostEngagementUpdate(BaseModel):
    view_time: int  # in seconds
    completion_rate: float
    bounce: bool
    interaction_type: Optional[str]

class PostAnalysisResult(BaseModel):
    fallacy_score: float
    fallacy_types: List[str]
    evidence_score: float
    evidence_types: List[str]
    bias_score: float
    bias_types: List[str]
    action_score: float
    implementation_complexity: float
    resource_requirements: Dict
    estimated_timeline: Dict