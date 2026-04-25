from bson import ObjectId
from fastapi import APIRouter, HTTPException

from app.config.database import connect_database, get_database_status
from app.models.analysis_record import ANALYSIS_COLLECTION, serialize_object_id

router = APIRouter(tags=["analysis-storage"])


@router.get("/analysis/{analysis_id}")
async def get_analysis_record(analysis_id: str):
    if not ObjectId.is_valid(analysis_id):
        raise HTTPException(status_code=400, detail="Invalid analysis id")

    db = connect_database()
    record = db[ANALYSIS_COLLECTION].find_one({"_id": ObjectId(analysis_id)})
    return {"success": True, "data": serialize_object_id(record)}


@router.get("/db-status")
async def database_status():
    return {
        "success": True,
        "data": get_database_status()
    }
