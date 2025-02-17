# cors_middleware.py

from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketDisconnect

def setup_cors_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  # Your frontend URL
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Credentials",
            "Sec-WebSocket-Protocol",  # Required for WebSocket
            "Sec-WebSocket-Key",       # Required for WebSocket
            "Sec-WebSocket-Version",   # Required for WebSocket
            "Upgrade",                 # Required for WebSocket
            "Connection"               # Required for WebSocket
        ],
        expose_headers=["*"],
        max_age=3600,  # Cache preflight requests for 10 minutes
    )

    @app.exception_handler(WebSocketDisconnect)
    async def websocket_disconnect(request, exc):
        print(f"WebSocket disconnected: {exc.code}")
        return None
