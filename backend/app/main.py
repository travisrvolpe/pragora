# main.py
import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import (
    auth_routes, profile_routes, post_routes,
    comment_routes, category_routes, post_engagement_routes
)
from database.database import database, Base, engine, SessionLocal
from app.utils.database_utils import (
    init_categories, init_post_types, init_post_interaction_types
)
from app.core.config import settings
from app.core.cache import init_redis, close_redis

# Initialize the app
Base.metadata.create_all(bind=engine)
app = FastAPI()

# Media directory setup
settings.create_media_directories()
app.mount("/media", StaticFiles(directory="media"), name="media")
app.mount("/avatars", StaticFiles(directory="media/avatars"), name="avatars")

# CORS configuration with explicit headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"], #["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Headers",
    ],
    expose_headers=["*"],
    max_age=600,
)

# GraphQL setup
@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, Pragora!"

schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(schema)

# Startup and shutdown events
@app.on_event("startup")
async def startup():
    print("Starting up...")
    await database.connect()
    try:
        await init_redis()
    except Exception as e:
        print(f"Redis initialization error: {str(e)}")
    await init_categories()
    await init_post_types()
    await init_post_interaction_types(SessionLocal())
    print("Startup complete")

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
    await close_redis()

# Include routers
app.include_router(graphql_app, prefix="/graphql")
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(post_routes.router)
app.include_router(comment_routes.router)
app.include_router(category_routes.router)
app.include_router(post_engagement_routes.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Pragora API"}