# Auth Service - Phase 3

## What it does
- `POST /signup`
- `POST /login`
- MongoDB user persistence
- `bcryptjs` password hashing
- JWT token generation
- Basic health and status endpoints

## Environment variables
- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `BCRYPT_ROUNDS`

## Run
```bash
cd services/auth-service
npm install
npm start
```

## Test
```bash
curl http://localhost:3001/health
curl -X POST http://localhost:3001/signup -H 'Content-Type: application/json' -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'
curl -X POST http://localhost:3001/login -H 'Content-Type: application/json' -d '{"email":"test@example.com","password":"Password123"}'
```
