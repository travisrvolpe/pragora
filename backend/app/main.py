# main.py
import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from fastapi.middleware.cors import CORSMiddleware
#from app.middleware import auth_middleware
from fastapi.staticfiles import StaticFiles

from app.routes import auth_routes, profile_routes, post_routes, comment_routes, category_routes, post_engagement_routes
from database.database import database, Base, engine,SessionLocal
from app.utils.database_utils import init_categories, init_post_types, init_post_interaction_types
from core.config import settings

Base.metadata.create_all(bind=engine)
app = FastAPI()

# Ensure media directories exist
settings.create_media_directories()

# Mount the media directory for serving files
# app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT), name="media")
app.mount("/media", StaticFiles(directory="media"), name="media")
app.mount("/avatars", StaticFiles(directory="media/avatars"), name="avatars")

#def setup_middleware(app):
#    app.add_middleware(
#        CORSMiddleware,
#        allow_origins=[settings.FRONTEND_URL],
#        allow_credentials=True,
#        allow_methods=["*"],
#        allow_headers=["*"],
#    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

# Define a basic GraphQL schema
# move to app/graphql/schema.py?
@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, Pragora!"

schema = strawberry.Schema(query=Query)

#Create GraphQL Router
graphql_app = GraphQLRouter(schema)

@app.on_event("startup")
async def startup():
    await database.connect()
    await init_categories()
    await init_post_types()
    await init_post_interaction_types(SessionLocal())

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

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