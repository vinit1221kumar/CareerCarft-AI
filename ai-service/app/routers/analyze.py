from fastapi import APIRouter, HTTPException
from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.analysis_repository import save_analysis_record
from app.services.analyzer import analyze_resume_text
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("", response_model=AnalyzeResponse)
async def analyze_resume(payload: AnalyzeRequest):
    try:
        analysis = analyze_resume_text(
            resume_text=payload.resume_text,
            candidate_name=payload.candidate_name,
            target_skills=payload.target_skills,
            job_title=payload.job_title,
        )
        saved_record = save_analysis_record(payload.model_dump(), analysis)

        return AnalyzeResponse(
            success=True,
            message="Resume analyzed successfully",
            data={
                **analysis,
                "analysis_record": saved_record,
            },
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Resume analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to analyze resume")
