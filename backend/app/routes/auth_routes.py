# app/routes/auth_routes.py
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends, Request

from app.core.cache import get_redis
from app.datamodels.user_datamodels import User, Session as UserSession
from app.utils.database_utils import get_db
from fastapi.middleware.cors import CORSMiddleware
from app.services.auth_service import register_user, login_user
from app.auth.utils import get_current_user
from app.schemas.user_schemas import UserCreate, UserLogin, UserResponse
from typing import Any
from app.core.logger import get_logger
from database.database import SessionLocal

# Then at module level:
logger = get_logger(__name__)

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
    try:
        print("Login attempt for email:", user.email)
        response = await login_user(user)

        # Ensure response has correct structure
        return {
            "status": "success",
            "access_token": response["access_token"],
            "token_type": "Bearer",
            "user": {
                "user_id": response["user"]["user_id"],
                "email": response["user"]["email"]
            }
        }
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

@router.get("/validate")
async def validate_token(current_user: User = Depends(get_current_user)):
    """Simple endpoint to check if the token is valid."""
    return {"valid": True, "user_id": current_user.user_id}

@router.post("/auth/session/cleanup")
async def cleanup_sessions(db: Session = Depends(get_db)):
    try:
        # Delete expired sessions
        db.query(UserSession).filter(
            UserSession.expires_at < datetime.utcnow()
        ).delete()

        # Get all active users
        active_users = db.query(User.user_id).all()

        # For each user, keep only their most recent session
        for user_id in active_users:
            sessions = db.query(UserSession).filter(
                UserSession.user_id == user_id[0]
            ).order_by(UserSession.created_at.desc()).all()

            # If user has multiple sessions, remove all but the most recent
            if len(sessions) > 1:
                for session in sessions[1:]:
                    db.delete(session)

        db.commit()
        return {"status": "success", "message": "Sessions cleaned up successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Session cleanup error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to cleanup sessions"
        )


@router.get("/auth/health")
async def check_auth_health():
    try:
        # Check Redis
        redis = await get_redis()
        redis_health = await redis.ping() if redis else False

        # Check Database
        db = SessionLocal()
        db_health = True
        try:
            db.execute("SELECT 1")
        except:
            db_health = False
        finally:
            db.close()

        return {
            "status": "healthy" if redis_health and db_health else "unhealthy",
            "redis": redis_health,
            "database": db_health,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }