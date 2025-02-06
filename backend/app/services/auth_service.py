# auth_service.py
from app.auth.auth import hash_password, verify_password
from app.auth.utils import create_access_token
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.datamodels.datamodels import User, UserProfile
from database.database import database
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from typing import Dict, Any
from app.utils.response_utils import create_response

async def register_user(user: UserCreate) -> Dict[str, Any]:
    """
    Register a new user and return a response with a token.
    """
    # Hash the password
    hashed_password = hash_password(user.password)
    print(f"Registering user with email: {user.email}")

    # Generate default username if not provided
    username = user.email.split("@")[0]

    # Check for duplicate email TODO CHANGE TO ORM
    query = "SELECT EXISTS (SELECT 1 FROM users WHERE email = :email)"
    values = {"email": user.email}
    email_exists = await database.fetch_one(query=query, values=values)
    print(f"Email exists check result: {email_exists}")
    #email_exists = db.query(User).filter(User.email == user.email).first()


    if email_exists and email_exists[0]:
        raise Exception("A user with this email already exists")

    # Ensure username is unique
    username_query = "SELECT username FROM user_profile WHERE username LIKE :username"
    username_exists = await database.fetch_all(query=username_query, values={"username": f"{username}%"})

    count = 1
    while username in [profile["username"] for profile in username_exists]:
        username = f"{username}{count}"
        count += 1

    # Create new user account in the `users` table
    insert_user_query = """
    INSERT INTO users (email, password_hash)
    VALUES (:email, :password_hash)
    RETURNING user_id, email
    """

    user_values = {
        "email": user.email,
        "password_hash": hashed_password,
    }

    new_user = await database.fetch_one(query=insert_user_query, values=user_values)
    print(f"New user created: {new_user}")

    # Create the user profile in the `user_profile` table
    insert_profile_query = """
    INSERT INTO user_profile (user_id, username, date_joined)
    VALUES (:user_id, :username, NOW())
    """

    profile_values = {
        "user_id": new_user["user_id"],
        "username": username,
    }
    await database.execute(query=insert_profile_query, values=profile_values)

    # Generate token for the new user
    access_token = create_access_token(data={"sub": str(new_user["user_id"])})

    # Return a response with relevant data
    return create_response(
        message="User registered successfully",
        data={
            "access_token": access_token,
            "token_type": "bearer",
            "username": username,
            "user": {
                "user_id": new_user["user_id"],
                "email": new_user["email"]
            }
        }
    )
    #except Exception as e:
        #print(f"Registration error: {str(e)}")
        #raise

async def login_user(user: UserLogin) -> Dict[str, Any]:
    """
    Authenticate a user and return a response with a token.
    """
    try:
        # Find the user by email
        user_query = "SELECT user_id, email, password_hash FROM users WHERE email = :email"
        db_user = await database.fetch_one(query=user_query, values={"email": user.email})

        if not db_user:
            raise Exception("User not found")

        # Verify the password
        if not verify_password(user.password, db_user["password_hash"]):
            raise Exception("Invalid credentials")

        # Retrieve the username from the user_profile table
        profile_query = "SELECT username FROM user_profile WHERE user_id = :user_id"
        db_profile = await database.fetch_one(query=profile_query, values={"user_id": db_user["user_id"]})

        if not db_profile:
            raise Exception("User profile not found")

        # Generate token for the authenticated user
        access_token = create_access_token(data={"sub": str(db_user["user_id"])})

        # Return a response with relevant data
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": db_user["user_id"],
                "email": db_user["email"]
            }
        }
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
'''async def login_user(user: UserLogin) -> Dict[str, Any]:
    """
    Authenticate a user and return a response with a token.
    """
    # Find the user by email
    user_query = "SELECT user_id, email, password_hash FROM users WHERE email = :email"
    db_user = await database.fetch_one(query=user_query, values={"email": user.email})

    if not db_user:
        raise Exception("User not found")

    # Verify the password
    if not verify_password(user.password, db_user["password_hash"]):
        raise Exception("Invalid credentials")

    # Retrieve the username from the user_profile table
    profile_query = "SELECT username FROM user_profile WHERE user_id = :user_id"
    db_profile = await database.fetch_one(query=profile_query, values={"user_id": db_user["user_id"]})

    if not db_profile:
        raise Exception("User profile not found")

    # Generate token for the authenticated user
    access_token = create_access_token(data={"sub": str(db_user["user_id"])})

    # Create the response using the Pydantic model
    response = TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            user_id=int(db_user["user_id"]),
            email=str(db_user["email"])
        )
    )

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": db_user["user_id"],
            "email": db_user["email"]
        }
    }
    except Exception as e:
    print(f"Login error: {str(e)}")
    raise


    return {
        "success": True,
        "access_token": response.access_token,
        "token_type": response.token_type,
        "user": {
            "user_id": response.user.user_id,
            "email": response.user.email
        }
    }'''