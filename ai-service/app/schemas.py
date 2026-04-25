from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=20, description="Raw resume text")
    candidate_name: Optional[str] = Field(default=None, description="Optional candidate name")
    job_title: Optional[str] = Field(default=None, description="Target job title")
    target_skills: Optional[List[str]] = Field(default=None, description="Optional target skills for scoring")


class EmbeddingsRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Text to embed")


class AnalyzeResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]


class EmbeddingsResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]
