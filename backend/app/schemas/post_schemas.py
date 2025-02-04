# schemas/post_schemas.py
from pydantic import BaseModel, Field, validator
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

    # Post metadata
    visibility: Optional[str] = "public"
    is_pinned: Optional[bool] = False
    is_draft: Optional[bool] = False
    parent_post_id: Optional[int] = None
    edit_history: Optional[Dict] = None

    tags: List[str] = Field(default_factory=list)

    @validator('subcategory_id')
    def validate_subcategory(cls, v, values):
        if v and not values.get('category_id'):
            raise ValueError('Cannot have subcategory without category')
        return v

    @validator('post_type_id')
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
    tags: List[str] = Field(default_factory=list)

    @validator('content')
    def validate_content(cls, value):
        if not value or not value.strip():
            raise ValueError('Content cannot be empty')
        return value.strip()

    @validator('post_type_id')
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

    likes_count: int
    dislikes_count: int
    loves_count: int
    hates_count: int
    saves_count: int
    shares_count: int
    comments_count: int
    reports_count: int

    # Engagement metrics
    view_count: Optional[int]
    unique_viewers: Optional[int]
    avg_view_duration: Optional[float]
    engagement_score: Optional[float]
    quality_score: Optional[float]

    # Fields for tracking user interactions
    like: bool = False
    dislike: bool = False
    hate: bool = False
    love: bool = False
    share: bool = False
    report: bool = False
    comment: bool = False
    reply: bool = False

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

class PostMetricsUpdate(BaseModel):
    likes: Optional[int] = Field(default=0)
    dislikes: Optional[int] = Field(default=0)
    loves: Optional[int] = Field(default=0)
    hates: Optional[int] = Field(default=0)
    saves: Optional[int] = Field(default=0)
    shares: Optional[int] = Field(default=0)
    comments: Optional[int] = Field(default=0)
    reports: Optional[int] = Field(default=0)

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