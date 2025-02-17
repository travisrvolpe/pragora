from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Annotated
from typing import Optional, List
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

