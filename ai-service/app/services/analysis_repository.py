import logging
from typing import Any, Dict, Optional

from app.config.database import connect_database
from app.models.analysis_record import ANALYSIS_COLLECTION, serialize_object_id

logger = logging.getLogger(__name__)


def save_analysis_record(payload: Dict[str, Any], analysis: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    try:
        db = connect_database()
        collection = db[ANALYSIS_COLLECTION]
        document = {
            "candidate_name": payload.get("candidate_name"),
            "job_title": payload.get("job_title"),
            "resume_text": payload.get("resume_text"),
            "target_skills": payload.get("target_skills") or [],
            "analysis": analysis,
            "source": "ai-service",
        }
        result = collection.insert_one(document)
        saved = collection.find_one({"_id": result.inserted_id})
        return serialize_object_id(saved)
    except Exception as exc:
        logger.warning("Failed to persist analysis record: %s", exc)
        return None
