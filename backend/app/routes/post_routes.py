# routes/post_routes.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import FileResponse
from typing import Optional, List
from sqlalchemy.orm import Session
from app.utils.database_utils import get_db
from app.schemas.post_schemas import PostCreate, PostInteractionCreate, PostMetricsUpdate, PostEngagementUpdate
from app.services import post_service
from app.auth.utils import get_current_user
from app.services.post_service import upload_post_image
from app.datamodels.post_datamodels import Post
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.datamodels.datamodels import User

# Add this near the top of your file
MEDIA_PATH = Path("./media")
if not MEDIA_PATH.exists():
    MEDIA_PATH.mkdir(parents=True)


router = APIRouter(prefix="/posts", tags=["posts"])

# Create a post
#@router.post("/", response_model=dict)
#async def create_post(
    #post: PostCreate,
    #current_user = Depends(get_current_user),
    #db: Session = Depends(get_db)
#):
    #result = await post_service.create_post(db, current_user.user_id, post)
    #return result.__dict__
@router.post("/", response_model=dict)
async def create_post(
    content: str = Form(...),
    post_type_id: str = Form(...),
    title: Optional[str] = Form(None),
    subtitle: Optional[str] = Form(None),
    summary: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    subcategory_id: Optional[str] = Form(None),
    custom_subcategory: Optional[str] = Form(None),
    visibility: Optional[str] = Form("public"),
    is_pinned: Optional[bool] = Form(False),
    is_draft: Optional[bool] = Form(False),
    parent_post_id: Optional[int] = Form(None),
    video_url: Optional[str] = Form(None),
    video_metadata: Optional[dict] = Form(None),
    audio_url: Optional[str] = Form(None),
    document_url: Optional[str] = Form(None),
    embedded_content: Optional[dict] = Form(None),
    link_preview: Optional[dict] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Debug log received data
        print("Received form data:")
        print(f"content: {content}")
        print(f"post_type_id: {post_type_id}")
        print(f"title: {title}")
        print(f"category_id: {category_id}")
        print(f"files: {files}")

        # Convert string IDs to integers where needed
        post_data = {
            "content": content,
            "post_type_id": int(post_type_id),
            "title": title,
            "subtitle": subtitle,
            "summary": summary,
            "category_id": int(category_id) if category_id else None,
            "subcategory_id": int(subcategory_id) if subcategory_id else None,
            "custom_subcategory": custom_subcategory,
            "visibility": visibility,
            "is_pinned": is_pinned,
            "is_draft": is_draft,
            "parent_post_id": parent_post_id,
            "video_url": video_url,
            "video_metadata": video_metadata,
            "audio_url": audio_url,
            "document_url": document_url,
            "embedded_content": embedded_content,
            "link_preview": link_preview
        }

        post_create = PostCreate(**post_data)
        return await post_service.create_post(db, current_user.user_id, post_create, files)

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"Error creating post: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/{post_id}", response_model=dict)
async def get_post(
    post_id: int,
    db: Session = Depends(get_db)
):
    # Track view only if user is authenticated
    try:
        current_user = await get_current_user()
        if current_user:
            await post_service.track_post_view(current_user.user_id, post_id, db)
    except:
        pass
    return await post_service.get_post(db, post_id)


@router.get("/trending/{timeframe}", response_model=dict)
async def get_trending_posts(
    timeframe: str,
    db: Session = Depends(get_db)
):
    return {"posts": await post_service.get_trending_posts(timeframe, db)}

@router.get("/recommended", response_model=dict)
async def get_recommended_posts(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {"posts": await post_service.get_recommended_posts(current_user.user_id, db)}

@router.post("/{post_id}/read", response_model=dict)
async def mark_as_read(
    post_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_service.mark_post_as_read(current_user.user_id, post_id, db)

@router.post("/{post_id}/engagement", response_model=dict)
async def update_engagement(
    post_id: int,
    engagement: PostEngagementUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update engagement metrics for a post"""
    await post_service.track_post_view(current_user.user_id, post_id, db)
    engagement_dict = engagement.dict()
    engagement_dict["user_id"] = current_user.user_id
    # Additional engagement tracking logic here
    return {"message": "Engagement updated successfully"}

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
# Public routes (no auth required)
@router.get("/", response_model=dict)
async def list_posts(
    skip: int = 0,
    limit: int = 20,
    category_id: Optional[int] = None,
    tab: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return await post_service.get_all_posts(db, skip, limit, category_id, tab)

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

@router.post("/posts/{post_id}/metrics", response_model=dict)
async def update_metrics(
    post_id: int,
    metrics: PostMetricsUpdate,
    db: Session = Depends(get_db),
):
    metrics_dict = metrics.dict(exclude_unset=True)
    return await post_service.update_post_metrics(db, post_id, metrics_dict)

@router.post("/{post_id}/upload-image")
async def upload_image(
    post_id: int,
    file: UploadFile,
    db: Session = Depends(get_db),
):
    return await upload_post_image(file, post_id, db)

from fastapi.responses import FileResponse


@router.get("/{post_id}/image")
async def fetch_image(post_id: int, db: Session = Depends(get_db)):
    post = await post_service.get_post(db, post_id)
    if not post["data"]["post"]["image_url"]:
        raise HTTPException(status_code=404, detail="Image not found")

    image_path = post["data"]["post"]["image_url"].lstrip('/')
    full_path = Path(image_path)

    if not full_path.exists():
        raise HTTPException(status_code=404, detail="Image file not found")

    return FileResponse(str(full_path))