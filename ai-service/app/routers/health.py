from fastapi import APIRouter
from datetime import datetime
import os

from app.config.database import get_database_status

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    return {
        "service": "AI Service",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("NODE_ENV", "development"),
        "database": get_database_status()
    }
