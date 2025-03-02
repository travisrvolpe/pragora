from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Community Note Schemas
class CommunityNoteCreate(BaseModel):
    post_id: int
    note_text: str
    evidence_links: Optional[Dict] = None
    is_source_citation: Optional[bool] = False
    is_fact_check: Optional[bool] = False
    is_context_addition: Optional[bool] = False


class CommunityNoteUpdate(BaseModel):
    note_text: Optional[str] = None
    evidence_links: Optional[Dict] = None
    status: Optional[str] = None
    impact_weight: Optional[float] = None
    is_source_citation: Optional[bool] = None
    is_fact_check: Optional[bool] = None
    is_context_addition: Optional[bool] = None


class CommunityNoteResponse(BaseModel):
    note_id: int
    user_id: int
    post_id: int
    note_text: str
    evidence_links: Optional[Dict]
    status: str
    helpfulness_score: float
    helpful_count: int
    not_helpful_count: int
    impact_weight: float
    created_at: datetime
    updated_at: datetime
    is_source_citation: bool
    is_fact_check: bool
    is_context_addition: bool
    # You could add user information for display
    username: Optional[str] = None
    user_reputation: Optional[int] = None

    class Config:
        from_attributes = True


class CommunityNoteRating(BaseModel):
    note_id: int
    helpful: bool