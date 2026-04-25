from fastapi import APIRouter, HTTPException
from app.schemas import EmbeddingsRequest, EmbeddingsResponse
from app.services.embedding_service import generate_embedding
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("", response_model=EmbeddingsResponse)
async def create_embeddings(payload: EmbeddingsRequest):
    try:
        vector = generate_embedding(payload.text)
        return EmbeddingsResponse(
            success=True,
            message="Embedding generated successfully",
            data={
                "dimension": len(vector),
                "vector": vector,
                "preview": vector[:10],
            },
        )
    except Exception as exc:
        logger.exception("Embedding generation failed: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to generate embeddings")
