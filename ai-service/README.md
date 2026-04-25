# AI Service - Phase 5

## What it does
- `POST /analyze`
- `POST /embeddings`
- `GET /health`
- `GET /`

## Features
- Structured resume extraction with 20+ fields
- Skill extraction with heuristic and model-backed support
- Sentence embeddings via `sentence-transformers`
- Resume scoring with breakdown and improvement suggestions
- Optional Hugging Face NER and zero-shot model loading

## Environment variables
- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `EMBEDDING_MODEL`
- `NER_MODEL`
- `ZERO_SHOT_MODEL`
- `CORS_ORIGINS`
- `MAX_BATCH_SIZE`

## Run
```bash
cd services/ai-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## Test
```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/analyze \
  -H 'Content-Type: application/json' \
  -d '{"resume_text":"John Doe\njohn@example.com\nExperienced Python developer with 5 years of experience in FastAPI, Docker, and AWS."}'

curl -X POST http://localhost:8000/embeddings \
  -H 'Content-Type: application/json' \
  -d '{"text":"Python FastAPI Docker AWS"}'
```
