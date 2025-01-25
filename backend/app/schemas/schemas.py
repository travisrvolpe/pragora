from pydantic import BaseModel, EmailStr, Field
from typing import Annotated
from typing import Optional, List
from datetime import datetime

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
        orm_mode = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

    class Config:
        orm_mode = True

class TokenData(BaseModel):
    user_id: Optional[int] = None

# Profile schemas
class ProfileBase(BaseModel):
    username: Optional[str] = None
    avatar_img: Optional[str] = None
    about: Optional[str] = None
    location: Optional[str] = None
    interests: Optional[str] = None
    credentials: Optional[str] = None
    expertise_area: Optional[str] = None
    is_messaging: Optional[bool] = True
    is_networking: Optional[bool] = True
    worldview_u: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    user_id: int
    username: str
    reputation_score: int
    reputation_cat: str
    post_cnt: int
    comment_cnt: int
    upvote_cnt: int
    date_joined: datetime

    class Config:
        orm_mode = True

class UserProfileResponse(UserResponse):
    profile: Optional[ProfileResponse] = None

    class Config:
        orm_mode = True

