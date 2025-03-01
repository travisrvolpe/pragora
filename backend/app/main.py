import asyncio
from contextlib import asynccontextmanager

import strawberry
from fastapi import FastAPI, WebSocket, Request, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from starlette.exceptions import HTTPException as StarletteHTTPException

# Remove the direct import of CORSMiddleware if you aren't using it anymore
# from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from strawberry.subscriptions import GRAPHQL_WS_PROTOCOL, GRAPHQL_TRANSPORT_WS_PROTOCOL

from app.lib.graphql.context import get_context
from app.lib.graphql.schema.schema import Query, Mutation, Subscription
from app.services.post_engagement_service import verify_all_post_counts
from database.database import database, Base, engine, SessionLocal
from app.utils.database_utils import (
    init_categories, init_post_types, init_post_interaction_types, sync_saved_posts, periodic_sync_saved_posts
)
from app.core.config import settings
from app.core.cache import init_redis, close_redis
from app.routes import (
    auth_routes, profile_routes, post_routes,
    comment_routes, category_routes, post_engagement_routes
)
from app.websocket_manager import manager
from app.middleware.auth_middleware import auth_middleware
from app.services.post_engagement_service import PostEngagementService
from app.RedisCache import get_cache
from app.middleware.cors_middleware import setup_cors_middleware

# Import your custom cors_middleware setup function
from app.middleware.cors_middleware import setup_cors_middleware

import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Outputs to console
    ]
)

logger = logging.getLogger(__name__)
logging.getLogger('app.applib.graphql').setLevel(logging.DEBUG)
logging.getLogger('app.auth').setLevel(logging.DEBUG)

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    print("Starting up...")
    await database.connect()

    try:
        await init_redis()
    except Exception as e:
        print(f"Redis initialization error: {str(e)}")

    db = SessionLocal()
    try:
        await init_categories()
        await init_post_types()
        await init_post_interaction_types(db)
        await sync_saved_posts(db)

        cache = get_cache()
        service = PostEngagementService(db, cache)

        # Keep only this call
        await service.repair_all_post_counts()
        print("✅ Post counts verified and fixed")
    except Exception as e:
        print(f"❌ Error during startup: {str(e)}")
    finally:
        db.close()

    # Store the task in app_instance.state
    app_instance.state = type('AppState', (), {})()
    app_instance.state.sync_task = asyncio.create_task(periodic_sync_saved_posts())

    print("Startup complete")
    yield

    # Use app_instance.state to access the task
    if hasattr(app_instance.state, 'sync_task') and app_instance.state.sync_task:
        app_instance.state.sync_task.cancel()
        try:
            await app_instance.state.sync_task
        except asyncio.CancelledError:
            print("Saved posts sync task cancelled")

    await database.disconnect()
    await close_redis()

app = FastAPI(lifespan=lifespan)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler that ensures CORS headers are included"""
    print(f"Global exception handler caught: {str(exc)}")

    # Create a response with CORS headers
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*"
        }
    )

@app.exception_handler(StarletteHTTPException)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTP exception handler with CORS headers"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": str(exc.detail)},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*"
        }
    )

app.state = type('AppState', (), {})()
app.state.sync_task = None

# Use your custom CORS setup
#setup_cors_middleware(app)

# If you still want your auth middleware applied, keep this line:
#app.middleware("http")(auth_middleware)

# CORS configuration
#app.add_middleware(
#    CORSMiddleware,
#    allow_origins=["http://localhost:3000"],  # Your frontend URL
#    allow_credentials=True,
#    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Be explicit about OPTIONS
#    allow_headers=["*"],  # Keep this broad for now for debugging
#    expose_headers=["Content-Type", "Content-Length"],
#    max_age=3600
#)
#app.middleware("http")(auth_middleware)
setup_cors_middleware(app)
app.middleware("http")(auth_middleware)

settings.create_media_directories()

app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription,
)

graphql_app = GraphQLRouter(
    schema,
    graphql_ide="graphiql",
    context_getter=get_context,
    subscription_protocols=[
        GRAPHQL_WS_PROTOCOL,
        GRAPHQL_TRANSPORT_WS_PROTOCOL
    ],
    allow_queries_via_get=True
)

app.include_router(graphql_app, prefix="/graphql")
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(post_routes.router)
app.include_router(comment_routes.router)
app.include_router(category_routes.router)
app.include_router(post_engagement_routes.router)

@app.websocket("/ws/post/{post_id}")
async def websocket_endpoint(websocket: WebSocket, post_id: int):
    await manager.connect(websocket, post_id)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast_to_post(post_id, data)
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
    finally:
        await manager.disconnect(websocket, post_id)

@app.get("/")
async def root():
    return {"message": "Welcome to Pragora API"}

@app.options("/posts/{post_id}")
async def options_post(post_id: int):
    return {}

@app.options("/posts/engagement/{post_id}/{action}")
async def options_engagement(post_id: int, action: str):
    return {}
