from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from app.services.auth_service import register_user, login_user
from app.auth.utils import get_current_user
from app.schemas.schemas import UserCreate, UserLogin, UserResponse
from typing import Any

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Add OPTIONS handler for /login
@router.options("/login")
async def auth_login_options():
    return {"message": "OK"}

@router.post("/login")
async def login(request: Request, user: UserLogin):
    """
    Authenticate a user and return a token along with user details.
    """
    try:
        print("Login attempt for email:", user.email)
        response = await login_user(user)
        print("Login successful, token generated:", response.get('access_token', 'No token'))
        return response
    except Exception as e:
        print("Login failed:", str(e))
        raise HTTPException(status_code=400, detail=str(e))

# Add OPTIONS handler for /register
@router.options("/register")
async def auth_register_options():
    return {"message": "OK"}

@router.post("/register")
async def register(user: UserCreate):
    """
    Register a new user and return a token.
    """
    try:
        response = await register_user(user)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user", response_model=UserResponse)
async def get_user(request: Request, current_user: UserResponse = Depends(get_current_user)):
    """
    Retrieve the current user's details.
    """
    auth_header = request.headers.get('Authorization')
    print("Auth header received:", auth_header)

    if not current_user:
        print("No current user found")
        raise HTTPException(status_code=401, detail="Not authenticated")

    print("User details retrieved for ID:", current_user.user_id)
    return current_user