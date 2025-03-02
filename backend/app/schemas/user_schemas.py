from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Annotated
from typing import Optional, List, Dict, Any
from datetime import datetime

DEFAULT_AVATAR_URL = 'assets/ZERO.PNG' #"/api/placeholder/120/120"

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    email: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserResponse

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    user_id: Optional[int] = None

# Profile schemas
class ProfileBase(BaseModel):
    username: Optional[str] = None
    avatar_img: Optional[str] = Field(default=DEFAULT_AVATAR_URL)
    about: Optional[str] = None
    location: Optional[str] = None
    interests: Optional[str] = None
    credentials: Optional[str] = None
    expertise_area: Optional[str] = None
    is_messaging: Optional[bool] = Field(default=True)
    is_networking: Optional[bool] = Field(default=True)
    worldview_u: Optional[str] = None

class ProfileCreate(ProfileBase):
    username: str
    pass

class ProfileUpdate(BaseModel):
    """Schema for profile update requests"""
    username: Optional[str] = None
    about: Optional[str] = None
    location: Optional[str] = None
    interests: Optional[str] = None
    credentials: Optional[str] = None
    expertise_area: Optional[str] = None
    is_messaging: Optional[bool] = None
    is_networking: Optional[bool] = None
    goals: Optional[str] = None
    gender: Optional[str] = None
    sex: Optional[str] = None
    worldview_u: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

'''class ProfileResponse(ProfileBase):
    user_id: int
    username: str
    reputation_score: int = Field(default=5)
    reputation_cat: str = Field(default='New Joiner')
    post_cnt: int = Field(default=0)
    comment_cnt: int = Field(default=0)
    upvote_cnt: int = Field(default=0)
    date_joined: datetime

    class Config:
        from_attributes = True'''

class ProfileResponse(BaseModel):
    """Profile response schema"""
    status: str
    data: dict

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "status": "success",
                "data": {
                    "user_id": 0,
                    "username": "testuser",
                    "avatar_img": "default_url",
                    "about": None,
                    "post_cnt": 0,
                    "comment_cnt": 0,
                    "upvote_cnt": 0,
                    "plan_cnt": 0,
                    "plan_comp_cnt": 0,
                    "plan_ip_cnt": 0,
                    "goals": None,
                    "is_messaging": True,
                    "is_networking": True,
                    "reputation_score": 5,
                    "reputation_cat": "New Joiner",
                    "interests": None,
                    "credentials": None,
                    "expertise_area": None,
                    "location": None,
                    "gender": None,
                    "sex": None,
                    "worldview_u": None,
                    "worldview_ai": None,
                    "date_joined": "2024-02-06T12:38:08.553045",
                    "role": "user",
                    "is_admin": False,
                    "is_instructor": False
                }
            }
        }
    )
class UserProfileResponse(UserResponse):
    user_id: int
    email: str
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True


# schemas/user_analysis_schemas.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class UserAnalysisCreate(BaseModel):
    soundness_score: Optional[float] = 0.0
    soundness_details: Optional[Dict] = None
    fallacy_score: Optional[float] = 0.0
    fallacy_details: Optional[Dict] = None
    evidence_quality_score: Optional[float] = 0.0
    evidence_details: Optional[Dict] = None
    misinformation_score: Optional[float] = 0.0
    misinformation_details: Optional[Dict] = None
    good_faith_score: Optional[float] = 0.0
    good_faith_details: Optional[Dict] = None
    bad_faith_score: Optional[float] = 0.0
    bad_faith_details: Optional[Dict] = None
    trolling_score: Optional[float] = 0.0
    propaganda_score: Optional[float] = 0.0
    divisiveness_score: Optional[float] = 0.0
    doomerism_score: Optional[float] = 0.0
    community_impact_score: Optional[float] = 0.0
    community_feedback: Optional[Dict] = None
    practical_utility_score: Optional[float] = 0.0
    saved_to_plans_count: Optional[int] = 0
    completed_plans_count: Optional[int] = 0
    implementation_complexity: Optional[float] = 0.0
    merit_points: Optional[int] = 0
    demerit_points: Optional[int] = 0
    analysis_version: Optional[str] = "1.0"


class UserAnalysisUpdate(UserAnalysisCreate):
    # Same as create schema since all fields are optional
    pass


class UserAnalysisResponse(BaseModel):
    user_analysis_id: int
    user_id: int
    soundness_score: float
    soundness_details: Optional[Dict]
    fallacy_score: float
    fallacy_details: Optional[Dict]
    evidence_quality_score: float
    evidence_details: Optional[Dict]
    misinformation_score: float
    misinformation_details: Optional[Dict]
    good_faith_score: float
    good_faith_details: Optional[Dict]
    bad_faith_score: float
    bad_faith_details: Optional[Dict]
    trolling_score: float
    propaganda_score: float
    divisiveness_score: float
    doomerism_score: float
    community_impact_score: float
    community_feedback: Optional[Dict]
    practical_utility_score: float
    saved_to_plans_count: int
    completed_plans_count: int
    implementation_complexity: float
    merit_points: int
    demerit_points: int
    last_updated: datetime
    analysis_version: str
    history: Optional[Dict]

    class Config:
        from_attributes = True


# Type Count Schemas
class FallacyTypeCountCreate(BaseModel):
    user_id: int
    fallacy_type: str
    count: int = 1
    severity_sum: float = 0.0
    last_detected: datetime = Field(default_factory=datetime.now)


class FallacyTypeCountUpdate(BaseModel):
    count: Optional[int] = None
    severity_sum: Optional[float] = None
    last_detected: Optional[datetime] = None


class FallacyTypeCountResponse(BaseModel):
    id: int
    user_id: int
    fallacy_type: str
    count: int
    severity_sum: float
    last_detected: datetime
    average_severity: Optional[float] = None

    class Config:
        from_attributes = True

    @property
    def average_severity(self) -> float:
        if self.count > 0:
            return self.severity_sum / self.count
        return 0.0


# Sound Reasoning Count Schemas
class SoundReasoningCountCreate(BaseModel):
    user_id: int
    reasoning_type: str
    count: int = 1
    quality_sum: float = 0.0
    last_detected: datetime = Field(default_factory=datetime.now)


class SoundReasoningCountUpdate(BaseModel):
    count: Optional[int] = None
    quality_sum: Optional[float] = None
    last_detected: Optional[datetime] = None


class SoundReasoningCountResponse(BaseModel):
    id: int
    user_id: int
    reasoning_type: str
    count: int
    quality_sum: float
    last_detected: datetime
    average_quality: Optional[float] = None

    class Config:
        from_attributes = True

    @property
    def average_quality(self) -> float:
        if self.count > 0:
            return self.quality_sum / self.count
        return 0.0


# Bad Faith Count Schemas
class BadFaithCountCreate(BaseModel):
    user_id: int
    behavior_type: str
    count: int = 1
    severity_sum: float = 0.0
    last_detected: datetime = Field(default_factory=datetime.now)


class BadFaithCountUpdate(BaseModel):
    count: Optional[int] = None
    severity_sum: Optional[float] = None
    last_detected: Optional[datetime] = None


class BadFaithCountResponse(BaseModel):
    id: int
    user_id: int
    behavior_type: str
    count: int
    severity_sum: float
    last_detected: datetime
    average_severity: Optional[float] = None

    class Config:
        from_attributes = True

    @property
    def average_severity(self) -> float:
        if self.count > 0:
            return self.severity_sum / self.count
        return 0.0


# Good Faith Count Schemas
class GoodFaithCountCreate(BaseModel):
    user_id: int
    behavior_type: str
    count: int = 1
    quality_sum: float = 0.0
    last_detected: datetime = Field(default_factory=datetime.now)


class GoodFaithCountUpdate(BaseModel):
    count: Optional[int] = None
    quality_sum: Optional[float] = None
    last_detected: Optional[datetime] = None


class GoodFaithCountResponse(BaseModel):
    id: int
    user_id: int
    behavior_type: str
    count: int
    quality_sum: float
    last_detected: datetime
    average_quality: Optional[float] = None

    class Config:
        from_attributes = True

    @property
    def average_quality(self) -> float:
        if self.count > 0:
            return self.quality_sum / self.count
        return 0.0


# User Analysis Summary Schema (for displaying on profiles)
class UserAnalysisSummary(BaseModel):
    soundness_score: float
    fallacy_score: float
    evidence_quality_score: float
    good_faith_score: float
    bad_faith_score: float
    practical_utility_score: float
    merit_points: int
    demerit_points: int
    top_strengths: List[Dict[str, Any]]  # List of strongest categories
    top_areas_for_improvement: List[Dict[str, Any]]  # List of weakest categories
    badges_earned: int
    highest_badge_level: Optional[str] = None

    class Config:
        from_attributes = True