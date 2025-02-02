# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import auth_routes, profile_routes, post_routes, comment_routes, category_routes
from database.database import database, Base, engine
from app.utils.database_utils import init_categories, init_post_types
from core.config import settings

Base.metadata.create_all(bind=engine)
app = FastAPI()

# Ensure media directories exist
settings.create_media_directories()

# Mount the media directory for serving files
# app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")
app.mount("/media", StaticFiles(directory="media"), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()
    await init_categories()
    await init_post_types()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(post_routes.router)
app.include_router(comment_routes.router)
app.include_router(category_routes.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Pragora API"}