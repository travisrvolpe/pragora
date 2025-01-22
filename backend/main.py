from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.routes.auth_routes import router as auth_router
from database.database import database, Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Front-end URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Include authentication routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
