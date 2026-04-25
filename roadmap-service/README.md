# Roadmap Service - Phase 6

## Endpoints
- `POST /generate-roadmap`
- `GET /latest/:userId`
- `GET /:id`
- `GET /health`
- `GET /status`

## Environment
- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `LLM_API_URL`
- `LLM_API_KEY`
- `LLM_MODEL`

## Run
```bash
cd services/roadmap-service
npm install
npm start
```

## Test
```bash
curl http://localhost:3003/health
curl -X POST http://localhost:3003/generate-roadmap \
  -H 'Content-Type: application/json' \
  -d '{"userId":"user123","targetRole":"Backend Engineer","experienceLevel":"beginner","durationWeeks":6,"currentSkills":["node","express"],"targetSkills":["mongodb","system design"],"focusAreas":["backend development","interview prep"]}'
```
