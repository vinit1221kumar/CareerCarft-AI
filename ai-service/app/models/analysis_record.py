from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId


ANALYSIS_COLLECTION = "analysis_records"


def serialize_object_id(document: Dict[str, Any]) -> Dict[str, Any]:
    if not document:
        return document

    serialized = dict(document)
    if "_id" in serialized and isinstance(serialized["_id"], ObjectId):
        serialized["_id"] = str(serialized["_id"])
    if "createdAt" in serialized and hasattr(serialized["createdAt"], "isoformat"):
        serialized["createdAt"] = serialized["createdAt"].isoformat()
    if "updatedAt" in serialized and hasattr(serialized["updatedAt"], "isoformat"):
        serialized["updatedAt"] = serialized["updatedAt"].isoformat()
    return serialized


def build_analysis_document(payload: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "candidate_name": payload.get("candidate_name"),
        "job_title": payload.get("job_title"),
        "resume_text": payload.get("resume_text"),
        "target_skills": payload.get("target_skills") or [],
        "analysis": analysis,
        "source": "ai-service",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
    }
