from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.services.auth_service import register_user, login_user
from app.auth.utils import get_current_user
from app.utils.database_utils import get_db
from app.datamodels.schemas import UserCreate, UserLogin, UserResponse

router = APIRouter()

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
async def login(user: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a token along with user details.
    """
    try:
        response = login_user(user, db)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user", response_model=UserResponse)
def get_user(current_user: UserResponse = Depends(get_current_user)):
    """
    Retrieve the current user's details.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user
