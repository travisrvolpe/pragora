# routes/post_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.schemas.post_schemas import PostCreate, PostInteractionCreate
from app.services import post_service
from app.auth.utils import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])

# Create a post
@router.post("/", response_model=dict)
async def create_post(
    post: PostCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = await post_service.create_post(db, current_user.user_id, post)
    return result.__dict__

# Get a Post
@router.get("/{post_id}", response_model=dict)
async def get_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    return await post_service.get_post(db, post_id)

# Get posts for the current user
@router.get("/me", response_model=dict)
async def get_my_posts(
    skip: int = 0,
    limit: int = 20,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_service.get_user_posts(db, current_user.user_id, skip, limit)

# List all posts
@router.get("/", response_model=dict)
async def list_posts(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return await post_service.get_all_posts(db, skip, limit)

# Delete a post
@router.delete("/{post_id}", response_model=dict)
async def delete_post(
    post_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_service.delete_post(db, post_id, current_user.user_id)

# Create a post interaction
@router.post("/interactions", response_model=dict)
async def create_post_interaction(
    interaction: PostInteractionCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interaction.user_id = current_user.user_id
    return await post_service.create_post_interaction(db, interaction)