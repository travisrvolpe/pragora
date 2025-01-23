# app/services/auth_service.py
from sqlalchemy.orm import Session
from app.auth.auth import hash_password, verify_password
from app.datamodels.datamodels import User, UserProfile
from app.utils.response_utils import create_response
from app.datamodels.schemas import UserLogin, TokenResponse, UserResponse
from app.auth.utils import create_access_token

def register_user(user, db: Session):
    """
    Register a new user and return a response with a token.
    """
    # Hash the password
    hashed_password = hash_password(user.password)

    # Generate default username if not provided
    username = user.email.split("@")[0]

    # Check for duplicate email
    if db.query(User).filter(User.email == user.email).first():
        raise Exception("A user with this email already exists")

    # Ensure username is unique
    existing_usernames = db.query(UserProfile.username).filter(
        UserProfile.username.like(f"{username}%")
    ).all()
    if username in existing_usernames:
        count = sum(1 for name in existing_usernames if name.startswith(username))
        username = f"{username}{count + 1}"

    # Create new user account in the `users` table
    new_user = User(
        email=user.email,
        password_hash=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create the user profile in the `user_profile` table
    new_profile = UserProfile(
        user_id=new_user.user_id,
        username=username,
        date_joined=new_user.created_at
    )
    db.add(new_profile)
    db.commit()

    # Generate token for the new user
    access_token = create_access_token(data={"sub": str(new_user.user_id)})

    # Return a response with relevant data
    return create_response(
        message="User registered successfully",
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "username": username,
            "user": {
                "user_id": new_user.user_id,
                "email": new_user.email
            }
        }
    )

def login_user(user: UserLogin, db: Session):
    """
    Authenticate a user and return a response with a token.
    """
    # Find the user by email
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise Exception("User not found")

    # Verify the password
    if not verify_password(user.password, db_user.password_hash):
        raise Exception("Invalid credentials")

    # Retrieve the username from the user_profile table
    db_profile = db.query(UserProfile).filter(UserProfile.user_id == db_user.user_id).first()
    if not db_profile:
        raise Exception("User profile not found")

    # Generate token for the authenticated user
    access_token = create_access_token(data={"sub": str(db_user.user_id)})

    # Create the response using the Pydantic model
    response = TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            user_id=int(db_user.user_id),
            email=str(db_user.email)
        )
    )

    return {
        "success": True,
        "access_token": response.access_token,
        "token_type": response.token_type,
        "user": {
            "user_id": response.user.user_id,
            "email": response.user.email
        }
    }