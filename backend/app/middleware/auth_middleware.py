from fastapi.middleware.cors import CORSMiddleware


def setup_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  # Your frontend URL
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=600,  # Cache preflight requests for 10 minutes
    )

    # Add other middleware here
    # e.g., authentication, logging, etc.