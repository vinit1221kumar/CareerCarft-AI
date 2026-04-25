# Analytics Service - Phase 7

## Endpoints
- `GET /insights`
- `GET /health`
- `GET /status`

## Behavior
- Generates user insights from resume and roadmap data
- Calculates skill gaps and recommendations
- Supports admin aggregation with `scope=admin`
- Stores insight snapshots in MongoDB

## Environment
- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `RESUME_SERVICE_URL`
- `ROADMAP_SERVICE_URL`
- `AI_SERVICE_URL`
- `AUTH_SERVICE_URL`

## Run
```bash
cd services/analytics-service
npm install
npm start
```

## Test
```bash
curl http://localhost:3004/health
curl "http://localhost:3004/insights?userId=user123&resumeId=<resumeId>&targetRole=Backend%20Engineer"
curl "http://localhost:3004/insights?scope=admin"
```
