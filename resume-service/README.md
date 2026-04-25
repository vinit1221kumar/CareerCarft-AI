# Resume Service - Phase 4

## Endpoints
- `POST /upload` — upload PDF/DOCX resume with field name `resume`
- `GET /resume/:id` — fetch stored resume data
- `GET /health`
- `GET /status`

## Environment
- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `UPLOAD_DIR`
- `MAX_FILE_SIZE`

## Run
```bash
cd services/resume-service
npm install
npm start
```

## Test
```bash
curl http://localhost:3002/health
curl -F "resume=@/path/to/resume.pdf" http://localhost:3002/upload
curl http://localhost:3002/resume/<id>
```
