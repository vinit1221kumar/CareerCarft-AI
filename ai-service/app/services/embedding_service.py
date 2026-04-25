import logging
import os
from functools import lru_cache
from typing import List

from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    logger.info("Loading embedding model: %s", model_name)
    try:
        return SentenceTransformer(model_name)
    except Exception as exc:
        logger.exception("Failed to load embedding model %s: %s", model_name, exc)
        raise


def generate_embedding(text: str) -> List[float]:
    model = get_embedding_model()
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist() if hasattr(vector, "tolist") else list(vector)


def generate_embedding_batch(texts: List[str]) -> List[List[float]]:
    model = get_embedding_model()
    vectors = model.encode(texts, normalize_embeddings=True)
    return vectors.tolist() if hasattr(vectors, "tolist") else [list(v) for v in vectors]
