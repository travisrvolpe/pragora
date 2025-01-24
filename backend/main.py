# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes, profile_routes, post_routes
from database.database import database, Base, engine
# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Front-end URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Include routers - note we're not adding the prefix here since it's defined in the router
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(post_routes.router)
@app.get("/")
async def root():
    return {"message": "Welcome to Pragora API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)