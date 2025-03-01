# routes/post_routes.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from fastapi.responses import FileResponse
from typing import Optional, List, Dict, Any

from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from sqlalchemy.exc import SQLAlchemyError
from fastapi.responses import JSONResponse

from app.schemas.schemas import UserResponse
from app.utils.database_utils import get_db
from app.schemas.post_schemas import PostCreate, PostResponse, PostInteractionCreate, PostMetricsUpdate, PostEngagementUpdate
from app.services import post_service

from app.auth.utils import get_current_user, get_current_user_or_none
from app.services.post_service import upload_post_image, create_post, get_post
from app.datamodels.post_datamodels import Post
from app.datamodels.interaction_datamodels import PostInteraction, InteractionType
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.datamodels.datamodels import User
from pydantic import BaseModel, ValidationError
from app.middleware.profile_middleware import validate_user_profile
from datetime import datetime


class UserPostResponse(BaseModel):
    post_id: int
    title: Optional[str] = None
    content: str
    created_at: str
    updated_at: Optional[str] = None
    status: str = "active"
    likes: int = 0
    comments: int = 0
    shares: int = 0
    views: int = 0
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class UserPostsListResponse(BaseModel):
    status: str = "success"
    message: str = "Posts retrieved successfully"
    posts: List[UserPostResponse]

    class Config:
        from_attributes = True

# Add this near the top of your file
MEDIA_PATH = Path("./media")
if not MEDIA_PATH.exists():
    MEDIA_PATH.mkdir(parents=True)

from app.core.logger import get_logger

logger = get_logger(__name__)
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

# routes/post_routes.py

# routes/post_routes.py

# routes/post_routes.py

@router.post("/", response_model=PostResponse)
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
        tags: Optional[List[str]] = Form([]),  # Default to empty list
        files: Optional[List[UploadFile]] = File(None),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """API route to create a post."""
    if not current_user or not current_user.user_id:
        raise HTTPException(status_code=401, detail="User authentication required")

    print(f"✅ Creating post for user: {current_user.user_id}")
    print(f"Received tags: {tags}")  # Debug print

    try:
        await validate_user_profile(current_user.user_id, db)

        # Convert form data into dictionary for PostCreate schema
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
            "link_preview": link_preview,
            "tags": tags if tags else []  # Ensure tags is never None
        }

        # Create post schema object
        post_create = PostCreate(**post_data)
        print(f"Created PostCreate object: {post_create}")  # Debug print

        # Create post and get response
        post_data = await post_service.create_post(db, current_user.user_id, post_create, files)

        if isinstance(post_data, dict) and 'data' in post_data and 'post' in post_data['data']:
            return post_data['data']['post']

        return post_data

    except ValidationError as e:
        print(f"❌ Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException as e:
        print(f"❌ HTTP error: {str(e)}")
        raise e
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{post_id}", response_model=None)  # Remove response_model constraint
async def get_post(
        post_id: int,
        current_user: Optional[UserResponse] = Depends(get_current_user_or_none),
        db: Session = Depends(get_db)
):
    """Get post by ID with additional interaction state check"""
    try:
        # Basic query using SQLAlchemy ORM
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            return JSONResponse(
                status_code=404,
                content={"status": "error", "message": "Post not found", "data": None},
                headers={"Access-Control-Allow-Origin": "http://localhost:3000",
                         "Access-Control-Allow-Credentials": "true"}
            )

        # Get user data if needed
        user_data = {}
        try:
            post_user = db.query(User).filter(User.user_id == post.user_id).first()
            if post_user and hasattr(post_user, 'profile') and post_user.profile:
                user_data = {
                    "username": post_user.profile.username,
                    "avatar_img": post_user.profile.avatar_img,
                    "reputation_score": post_user.profile.reputation_score,
                    "reputation_cat": post_user.profile.reputation_cat,
                    "expertise_area": post_user.profile.expertise_area,
                    "worldview_ai": getattr(post_user.profile, 'worldview_ai', None)
                }
        except Exception as e:
            print(f"Error getting user data: {str(e)}")
            # Default user data
            user_data = {
                "username": f"user_{post.user_id}",
                "avatar_img": None,
                "reputation_score": 0,
                "reputation_cat": "Newbie",
                "expertise_area": None,
                "worldview_ai": None
            }

        # Initialize interaction state with defaults
        interaction_state = {"like": False, "dislike": False, "save": False, "share": False, "report": False}

        # Check interactions if user is authenticated
        if current_user:
            try:
                # Get interaction types for reference
                interaction_types = db.query(InteractionType).all()
                interaction_type_map = {it.interaction_type_id: it.interaction_type_name for it in interaction_types}

                # Query for all interactions for this post by this user
                interactions = db.query(PostInteraction).filter(
                    PostInteraction.post_id == post_id,
                    PostInteraction.user_id == current_user.user_id
                ).all()

                # Update interaction state based on found interactions
                for interaction in interactions:
                    interaction_type = interaction_type_map.get(interaction.interaction_type_id)
                    if interaction_type in interaction_state:
                        interaction_state[interaction_type] = True
            except Exception as e:
                print(f"Error checking interactions: {str(e)}")

        # Create the response data with all required fields
        post_data = {
            "post_id": post.post_id,
            "user_id": post.user_id,
            **user_data,  # Add username, avatar, etc.

            # Post content fields with empty defaults
            "title": post.title or "",
            "subtitle": post.subtitle or "",
            "content": post.content or "",
            "summary": post.summary or "",

            # Media fields
            "image_url": post.image_url or "",
            "images": post.images or [],
            "video_url": post.video_url or "",
            "video_metadata": post.video_metadata or {},
            "audio_url": post.audio_url or "",
            "document_url": post.document_url or "",
            "embedded_content": post.embedded_content or {},
            "link_preview": post.link_preview or {},

            # Category fields
            "post_type_id": post.post_type_id or 1,
            "post_type": "thought",  # Default
            "category_id": post.category_id,
            "subcategory_id": post.subcategory_id,
            "custom_subcategory": post.custom_subcategory or "",

            # Status fields
            "visibility": post.visibility or "public",
            "is_pinned": post.is_pinned or False,
            "is_draft": post.is_draft or False,
            "parent_post_id": post.parent_post_id,
            "edit_history": post.edit_history or {},
            "tags": [],  # Default empty list
            "status": post.status or "active",

            # Timestamps
            "created_at": post.created_at,
            "updated_at": post.updated_at,

            # Metrics with defaults
            "like_count": post.like_count or 0,
            "dislike_count": post.dislike_count or 0,
            "save_count": post.save_count or 0,
            "share_count": post.share_count or 0,
            "comment_count": post.comment_count or 0,
            "report_count": post.report_count or 0,

            # Add interaction state booleans
            "like": interaction_state["like"],
            "dislike": interaction_state["dislike"],
            "save": interaction_state["save"],
            "share": interaction_state["share"],
            "report": interaction_state["report"],

            # Engagement metrics with defaults
            "view_count": 0,
            "unique_viewers": 0,
            "avg_view_duration": 0.0,
            "engagement_score": 0.0,
            "quality_score": 0.0,

            # Add metrics and interaction_state as top-level objects too
            "metrics": {
                "like_count": post.like_count or 0,
                "dislike_count": post.dislike_count or 0,
                "save_count": post.save_count or 0,
                "share_count": post.share_count or 0,
                "comment_count": post.comment_count or 0,
                "report_count": post.report_count or 0
            },
            "interaction_state": interaction_state
        }

        # Return success response
        return JSONResponse(
            content={"status": "success", "message": "Post retrieved successfully", "data": {"post": post_data}},
            headers={"Access-Control-Allow-Origin": "http://localhost:3000", "Access-Control-Allow-Credentials": "true"}
        )

    except Exception as e:
        print(f"ERROR in get_post: {str(e)}")
        import traceback
        traceback.print_exc()

        # Return error response with CORS headers
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Error retrieving post: {str(e)}", "data": None},
            headers={"Access-Control-Allow-Origin": "http://localhost:3000", "Access-Control-Allow-Credentials": "true"}
        )
@router.get("/{post_id}/debug", response_model=dict)
async def debug_post(
        post_id: int,
        current_user: Optional[UserResponse] = Depends(get_current_user_or_none),
        db: Session = Depends(get_db)
):
    """Debug endpoint to check post state and interactions"""
    try:
        # Get post
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Basic post info
        post_info = {
            "post_id": post.post_id,
            "title": post.title,
            "status": post.status,
            "metrics": {
                "like_count": post.like_count or 0,
                "dislike_count": post.dislike_count or 0,
                "save_count": post.save_count or 0,
                "share_count": post.share_count or 0,
                "comment_count": post.comment_count or 0,
                "report_count": post.report_count or 0
            }
        }

        # Interaction info if user is authenticated
        interaction_info = {}
        if current_user:
            # Get interaction types
            interaction_types = db.query(InteractionType).all()
            interaction_types_dict = {it.interaction_type_id: it.interaction_type_name for it in interaction_types}

            # Get user's interactions with this post
            interactions = db.query(PostInteraction).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.user_id == current_user.user_id
            ).all()

            interaction_info["interactions"] = [
                {
                    "interaction_id": inter.interaction_id,
                    "type": interaction_types_dict.get(inter.interaction_type_id, "unknown"),
                    "created_at": inter.created_at
                }
                for inter in interactions
            ]

            # Check if post is in saved_posts
            user = db.query(User).filter(User.user_id == current_user.user_id).first()
            is_in_saved_posts = False
            if user:
                saved_post_ids = [p.post_id for p in user.saved_posts]
                is_in_saved_posts = post_id in saved_post_ids

            interaction_info["in_saved_posts"] = is_in_saved_posts

        # Get actual interaction counts
        interaction_counts = (
            db.query(
                InteractionType.interaction_type_name,
                func.count(PostInteraction.interaction_id)
            )
            .outerjoin(PostInteraction, and_(
                PostInteraction.interaction_type_id == InteractionType.interaction_type_id,
                PostInteraction.post_id == post_id
            ))
            .group_by(InteractionType.interaction_type_name)
            .all()
        )

        # Format response
        return {
            "post": post_info,
            "user_interactions": interaction_info if current_user else None,
            "actual_counts": {name: count for name, count in interaction_counts},
            "discrepancies": {
                f"{name}_count": (count != getattr(post, f"{name}_count", 0))
                for name, count in interaction_counts
                if hasattr(post, f"{name}_count")
            }
        }

    except Exception as e:
        print(f"Error in debug_post: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Debug error: {str(e)}")


@router.get("/debug/saved-posts")
async def debug_saved_posts(
        current_user: UserResponse = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Debug endpoint to check saved_posts relationship"""
    try:
        # Get the user
        user = db.query(User).filter(User.user_id == current_user.user_id).first()
        if not user:
            return {"error": "User not found"}

        # Print user details for debugging
        print(f"User ID: {user.user_id}")

        # Check if the saved_posts attribute exists and is iterable
        has_saved_posts_attr = hasattr(user, 'saved_posts')
        is_iterable = False
        if has_saved_posts_attr:
            try:
                saved_post_count = len(user.saved_posts)
                is_iterable = True
            except Exception as e:
                print(f"Error accessing saved_posts: {str(e)}")
                saved_post_count = "Error - not iterable"
        else:
            saved_post_count = "No attribute"

        # Build response
        response = {
            "has_saved_posts_attr": has_saved_posts_attr,
            "is_iterable": is_iterable,
            "saved_post_count": saved_post_count
        }

        # Try to safely get saved posts
        saved_posts = []
        if has_saved_posts_attr and is_iterable:
            try:
                for post in user.saved_posts:
                    saved_posts.append({
                        "post_id": post.post_id,
                        "title": post.title if hasattr(post, 'title') else None,
                        "content": post.content[:50] + "..." if hasattr(post, 'content') and post.content else None
                    })
                response["saved_posts"] = saved_posts
            except Exception as e:
                print(f"Error iterating through saved_posts: {str(e)}")
                response["saved_posts_error"] = str(e)

        # Also check post_interactions table
        save_type = db.query(InteractionType).filter(
            InteractionType.interaction_type_name == "save"
        ).first()

        save_interactions = []
        if save_type:
            interactions = db.query(PostInteraction).filter(
                PostInteraction.user_id == current_user.user_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).all()

            for inter in interactions:
                save_interactions.append({
                    "post_id": inter.post_id,
                    "interaction_id": inter.interaction_id,
                    "created_at": inter.created_at.isoformat() if inter.created_at else None
                })

        response["save_interactions"] = save_interactions
        response["save_interactions_count"] = len(save_interactions)

        # Check for inconsistencies
        if has_saved_posts_attr and is_iterable:
            saved_post_ids = {post.get("post_id") for post in saved_posts}
            interaction_post_ids = {inter.get("post_id") for inter in save_interactions}

            missing_in_saved_posts = interaction_post_ids - saved_post_ids
            missing_in_interactions = saved_post_ids - interaction_post_ids

            response["inconsistencies"] = {
                "posts_in_interactions_but_not_in_saved_posts": list(missing_in_saved_posts),
                "posts_in_saved_posts_but_not_in_interactions": list(missing_in_interactions),
                "is_consistent": len(missing_in_saved_posts) == 0 and len(missing_in_interactions) == 0
            }

        return response

    except Exception as e:
        print(f"Debug error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@router.post("/{post_id}/repair-save-state", response_model=dict)
async def repair_save_state(
        post_id: int,
        current_user: UserResponse = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Endpoint to repair save state inconsistencies"""
    try:
        # Get post
        post = db.query(Post).filter(Post.post_id == post_id).first()
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        # Get user
        user = db.query(User).filter(User.user_id == current_user.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get save interaction type
        save_type = db.query(InteractionType).filter(
            InteractionType.interaction_type_name == "save"
        ).first()
        if not save_type:
            raise HTTPException(status_code=500, detail="Save interaction type not found")

        # Check if interaction exists
        existing_interaction = db.query(PostInteraction).filter(
            PostInteraction.post_id == post_id,
            PostInteraction.user_id == current_user.user_id,
            PostInteraction.interaction_type_id == save_type.interaction_type_id
        ).first()

        # Check if post is in saved_posts
        is_in_saved_posts = post in user.saved_posts

        # Determine if there's an inconsistency
        inconsistent = (existing_interaction is not None) != is_in_saved_posts

        # Fix inconsistency if needed
        if inconsistent:
            if existing_interaction and not is_in_saved_posts:
                # Add to saved_posts
                user.saved_posts.append(post)
                message = "Added post to saved_posts relationship"
            elif is_in_saved_posts and not existing_interaction:
                # Add interaction
                new_interaction = PostInteraction(
                    post_id=post_id,
                    user_id=current_user.user_id,
                    interaction_type_id=save_type.interaction_type_id,
                    target_type="POST"
                )
                db.add(new_interaction)
                message = "Added save interaction record"

            # Update save_count
            save_count = db.query(func.count(PostInteraction.interaction_id)).filter(
                PostInteraction.post_id == post_id,
                PostInteraction.interaction_type_id == save_type.interaction_type_id
            ).scalar() or 0

            post.save_count = save_count

            # Commit changes
            db.commit()
        else:
            message = "No inconsistency detected"

        # Get current state after repair
        existing_interaction = db.query(PostInteraction).filter(
            PostInteraction.post_id == post_id,
            PostInteraction.user_id == current_user.user_id,
            PostInteraction.interaction_type_id == save_type.interaction_type_id
        ).first()

        is_in_saved_posts = post in user.saved_posts

        return {
            "message": message,
            "was_inconsistent": inconsistent,
            "current_state": {
                "has_interaction": existing_interaction is not None,
                "in_saved_posts": is_in_saved_posts,
                "save_count": post.save_count
            }
        }

    except Exception as e:
        if db.in_transaction():
            db.rollback()
        print(f"Error in repair_save_state: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Repair error: {str(e)}")

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
    # Ensure user has profile
    await validate_user_profile(current_user.user_id, db)
    return await post_service.mark_post_as_read(current_user.user_id, post_id, db)


#@router.post("/{post_id}/engagement", response_model=dict)
#async def update_engagement(
#        post_id: int,
#        engagement: PostEngagementUpdate,
#        current_user=Depends(get_current_user),
#        db: Session = Depends(get_db)
#):
#    """Update engagement metrics for a post"""
#    # Ensure user has profile
#    await validate_user_profile(current_user.user_id, db)

#    await post_service.track_post_view(current_user.user_id, post_id, db)
#    engagement_dict = engagement.dict()
#    engagement_dict["user_id"] = current_user.user_id
#    return {"message": "Engagement updated successfully"}
# Get posts for the current user

@router.get("/me/debug")  # No response_model
async def get_my_posts_debug(
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get posts for the currently logged-in user without response validation"""
    try:
        # Query for posts
        posts = db.query(Post) \
            .filter(Post.user_id == current_user.user_id) \
            .filter(Post.status == 'active') \
            .order_by(Post.created_at.desc()) \
            .all()

        # Manually construct the response without relying on Pydantic models
        serialized_posts = []
        for post in posts:
            # Build a dictionary with only the fields we need
            post_dict = {
                "post_id": post.post_id,
                "title": post.title,
                "content": post.content,
                "created_at": post.created_at.isoformat() if post.created_at else None,
                "updated_at": post.updated_at.isoformat() if post.updated_at else None,
                "status": post.status or "active",  # Ensure status is included
                "likes": post.like_count or 0,
                "comments": post.comment_count or 0,
                "shares": post.share_count or 0,
                "views": 0
            }

            # Optionally add image_url if it exists
            if hasattr(post, 'image_url') and post.image_url:
                post_dict["image_url"] = post.image_url

            serialized_posts.append(post_dict)

        # Return a simple dictionary that will be automatically converted to JSON
        return {
            "success": True,
            "count": len(serialized_posts),
            "posts": serialized_posts
        }

    except Exception as e:
        # Log detailed error
        print(f"Error in get_my_posts_debug: {str(e)}")
        import traceback
        traceback.print_exc()

        # Return error response
        return {
            "success": False,
            "error": str(e),
            "posts": []
        }

# Also temporarily modify the original endpoint to return a minimal response
@router.get("/me")
async def get_my_posts(
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get posts for the currently logged-in user"""
    try:
        # Query for posts
        posts = db.query(Post) \
            .filter(Post.user_id == current_user.user_id) \
            .filter(Post.status == 'active') \
            .order_by(Post.created_at.desc()) \
            .all()

        # Manually construct the response without relying on Pydantic models
        serialized_posts = []
        for post in posts:
            # Build a dictionary with only the fields we need
            post_dict = {
                "post_id": post.post_id,
                "title": post.title,
                "content": post.content,
                "created_at": post.created_at.isoformat() if post.created_at else None,
                "updated_at": post.updated_at.isoformat() if post.updated_at else None,
                "status": post.status or "active",
                "likes": post.like_count or 0,
                "comments": post.comment_count or 0,
                "shares": post.share_count or 0,
                "views": 0
            }

            # Optionally add image_url if it exists
            if hasattr(post, 'image_url') and post.image_url:
                post_dict["image_url"] = post.image_url

            serialized_posts.append(post_dict)

        # Return a simple dictionary that will be automatically converted to JSON
        return {
            "success": True,
            "count": len(serialized_posts),
            "posts": serialized_posts
        }

    except Exception as e:
        # Log detailed error
        print(f"Error in get_my_posts: {str(e)}")
        import traceback
        traceback.print_exc()

        # Return error response
        return {
            "success": False,
            "error": str(e),
            "posts": []
        }

# List all posts
# Public routes (no auth required)
@router.get("/", response_model=dict)
async def list_posts(
    skip: int = 0,
    limit: int = 20,
    category_id: Optional[int] = None,
    tab: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get all posts with optional filtering and user interaction state"""
    # Pass user_id if authenticated
    user_id = current_user.user_id if current_user else None
    return await post_service.get_all_posts(db, skip, limit, category_id, tab, user_id)

# Delete a post
@router.delete("/{post_id}", response_model=dict)
async def delete_post(
    post_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await post_service.delete_post(db, post_id, current_user.user_id)

# Create a post interaction
#@router.post("/interactions", response_model=dict)
#async def create_post_interaction(
#    interaction: PostInteractionCreate,
#    current_user = Depends(get_current_user),
#    db: Session = Depends(get_db)
#):
#.user_id = current_user.user_id
#    return await post_service.create_post_interaction(db, interaction)


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


@router.get("/saved-posts", response_model=Dict[str, List[int]])
async def get_saved_posts(
        current_user: UserResponse = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Get IDs of posts saved by the current user"""
    # Try to get from saved_posts relationship first
    user = db.query(User).filter(User.user_id == current_user.user_id).first()
    saved_post_ids = [post.post_id for post in user.saved_posts]

    # Also check post_interactions table for any saved posts
    saved_interactions = db.query(PostInteraction).join(InteractionType).filter(
        PostInteraction.user_id == current_user.user_id,
        InteractionType.interaction_type_name == "save"
    ).all()

    # Add any post IDs that were found in interactions but not in saved_posts
    for interaction in saved_interactions:
        if interaction.post_id not in saved_post_ids:
            saved_post_ids.append(interaction.post_id)

    return {"saved_posts": saved_post_ids}
