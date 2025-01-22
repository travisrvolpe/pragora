from sqlalchemy.orm import Session
from app.auth.auth import hash_password, verify_password
from app.datamodels.datamodels import User
from app.utils.response_utils import create_response
from app.datamodels.schemas import UserLogin
from app.auth.utils import create_access_token

def register_user(user, db: Session):
    """
    Register a new user and return a response with a token.
    """
    hashed_password = hash_password(user.password)
    new_user = User(username=user.username, email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token for the new user
    access_token = create_access_token(data={"sub": new_user.username})

    return create_response(
        message="User registered successfully",
        data={
            "username": new_user.username,
            "email": new_user.email,
            "access_token": access_token,
            "success": True
        }
    )

def login_user(user: UserLogin, db: Session):
    """
    Authenticate a user and return a response with a token.
    """
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise Exception("User not found")

    if not verify_password(user.password, db_user.password_hash):
        raise Exception("Invalid credentials")

    # Generate token for the authenticated user
    access_token = create_access_token(data={"sub": db_user.username})

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.user_id,
            "username": db_user.username,
            "email": db_user.email
        }
    }

