from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from app.services.auth_service import register_user, login_user
from app.auth.utils import get_current_user
from app.utils.database_utils import get_db
from app.datamodels.schemas import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user and return a token.
    """
    try:
        response = register_user(user, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(request: Request, user: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a token along with user details.
    """
    try:
        print("Login attempt for email:", user.email)
        response = login_user(user, db)
        print("Login successful, token generated:", response.get('access_token', 'No token'))
        return response
    except Exception as e:
        print("Login failed:", str(e))
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