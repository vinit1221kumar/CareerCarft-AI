# API Gateway - Phase 2

**Production-Grade API Gateway for CareerCraft Microservices**

---

## 📋 Overview

The API Gateway serves as a single entry point for all CareerCraft microservices, providing:

- **Request Routing** - Intelligent routing to 5 backend services
- **Advanced Logging** - File-based access and error logs
- **JWT Authentication** - Token verification and management
- **Security Middleware** - Input validation, sanitization, and attack prevention
- **Health Monitoring** - Service status checks and health endpoints
- **Error Aggregation** - Unified error handling and responses
- **Request Tracing** - Unique request IDs for debugging

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│      Frontend (React + Vite)                │
│      Port: 5173                             │
└────────────────────┬────────────────────────┘
                     │
                     │ HTTP/JSON
                     ▼
┌─────────────────────────────────────────────┐
│      API Gateway (Node.js + Express)        │
│      Port: 3000                             │
│  ┌───────────────────────────────────────┐  │
│  │  Middleware Stack:                    │  │
│  │  • CORS                               │  │
│  │  • Request ID Generation              │  │
│  │  • Logging                            │  │
│  │  • Validation                         │  │
│  │  • JWT Verification                   │  │
│  │  • Error Handling                     │  │
│  └───────────────────────────────────────┘  │
└────┬──────┬──────┬──────┬──────┬────────────┘
     │      │      │      │      │
     │      │      │      │      │
     ▼      ▼      ▼      ▼      ▼
   /auth  /resume /ai  /roadmap /analytics
    │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼
   Auth   Resume  AI   Roadmap Analytics
   3001   3002   8000   3003    3004
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd gateway
npm install
```

### 2. Configure Environment

Edit `.env` file:

```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:5173

AUTH_SERVICE_URL=http://localhost:3001
RESUME_SERVICE_URL=http://localhost:3002
AI_SERVICE_URL=http://localhost:8000
ROADMAP_SERVICE_URL=http://localhost:3003
ANALYTICS_SERVICE_URL=http://localhost:3004
```

### 3. Start Gateway

```bash
npm run dev
# Output:
# ╔════════════════════════════════════════╗
# ║   🚀 API Gateway is running           ║
# ║   Port: 3000                          ║
# ║   Environment: development            ║
# ║   PID: 12345                          ║
# ╚════════════════════════════════════════╝
```

### 4. Verify Health

```bash
curl http://localhost:3000/health
```

---

## 📚 Endpoints

### Gateway Endpoints

#### 1. Health Check
```http
GET /health
```

**Response (200):**
```json
{
  "service": "API Gateway",
  "status": "healthy",
  "timestamp": "2024-04-03T10:45:30.123Z",
  "uptime": 45.123,
  "environment": "development",
  "version": "1.0.0"
}
```

#### 2. Services Status
```http
GET /status
```

**Response (200):**
```json
{
  "gateway": "healthy",
  "overall_status": "operational",
  "services": {
    "auth": true,
    "resume": true,
    "ai": true,
    "roadmap": true,
    "analytics": true
  },
  "timestamp": "2024-04-03T10:45:30.123Z",
  "environment": "development"
}
```

#### 3. Gateway Info
```http
GET /info
```

**Response (200):**
```json
{
  "name": "CareerCraft API Gateway",
  "version": "1.0.0",
  "description": "Central API Gateway for CareerCraft microservices",
  "environment": "development",
  "services": {
    "auth": "/auth",
    "resume": "/resume",
    "ai": "/ai",
    "roadmap": "/roadmap",
    "analytics": "/analytics"
  },
  "endpoints": {
    "health": "GET /health",
    "status": "GET /status",
    "info": "GET /info"
  },
  "timestamp": "2024-04-03T10:45:30.123Z"
}
```

### Service Routing

All requests to the following paths are automatically routed to their respective services:

| Route | Service | Port |
|-------|---------|------|
| `/auth/*` | Auth Service | 3001 |
| `/resume/*` | Resume Service | 3002 |
| `/ai/*` | AI Service | 8000 |
| `/roadmap/*` | Roadmap Service | 3003 |
| `/analytics/*` | Analytics Service | 3004 |

**Example:**
```bash
# Request to gateway
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Automatically routed to
# POST http://localhost:3001/auth/signup
```

---

## 🔐 Authentication

### JWT Token Handling

#### Include Token in Request

```bash
curl http://localhost:3000/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Token Format
- **Header:** `Authorization: Bearer <token>`
- **Supported:** Standard JWT tokens
- **Extraction:** Bearer scheme only

#### Token Processing
1. Token is extracted from `Authorization` header
2. Token is verified using `JWT_SECRET`
3. User information is stored in `req.user`
4. Token expiry is checked
5. Public endpoints work without token

---

## 🛡️ Security Features

### 1. Input Validation

| Check | Behavior |
|-------|----------|
| Content-Type | Only `application/json` accepted for POST/PUT |
| Request Size | Maximum 10MB per request |
| XSS Prevention | `<script>` tags removed from query params |
| SQL Injection | Special characters escaped |
| Path Traversal | `..` and `//` in URLs rejected |

### 2. Request Headers

All proxied requests include:
- `X-Request-ID` - Unique request identifier
- `X-Forwarded-For` - Client IP address
- `X-Forwarded-Proto` - Protocol (http/https)
- `X-Forwarded-Host` - Original host

### 3. CORS Configuration

```javascript
{
  origin: 'http://localhost:5173',      // Frontend URL
  credentials: true,                     // Allow cookies
  optionsSuccessStatus: 200
}
```

### 4. Error Responses

All errors include:
- **Unique Error Code** - For programmatic handling
- **Human-Readable Message** - For debugging
- **Request ID** - For tracing
- **Timestamp** - When error occurred
- **HTTP Status Code** - Standard HTTP status

---

## 📊 Logging

### Log Files

Gateway creates logs in `./logs/` directory:

```
logs/
├── access.log    # Successful requests (2xx, 3xx)
└── error.log     # Failed requests (4xx, 5xx)
```

### Log Format

**Console Output (JSON):**
```json
[INFO] {"timestamp":"2024-04-03T10:45:30.123Z","method":"GET","path":"/health","status":200,"duration":"5ms","userId":"anonymous","service":"gateway","ip":"127.0.0.1"}
```

**File Output (Morgan Format):**
```
GET /health 200 5ms | User: anonymous | Service: gateway | 235 bytes - Mozilla/5.0...
```

### Log Levels

- **INFO** - Successful requests (2xx, 3xx)
- **WARN** - Invalid tokens, missing auth
- **ERROR** - Failed requests (4xx, 5xx)

### View Logs

```bash
# Real-time access logs
tail -f logs/access.log

# Real-time error logs
tail -f logs/error.log

# Search for specific request
grep "X-Request-ID: 1712153130123-a1b2c3d4e5" logs/*.log

# See last 50 errors
tail -50 logs/error.log
```

---

## ❌ Error Handling

### Error Response Format

```json
{
  "error": {
    "message": "Service unavailable",
    "code": "SERVICE_UNAVAILABLE",
    "statusCode": 503,
    "timestamp": "2024-04-03T10:45:30.123Z",
    "requestId": "1712153130123-a1b2c3d4e5",
    "path": "/resume/upload"
  }
}
```

### Common Error Codes

| Code | Status | Scenario |
|------|--------|----------|
| INVALID_CONTENT_TYPE | 400 | Wrong Content-Type header |
| PAYLOAD_TOO_LARGE | 413 | Request > 10MB |
| INVALID_PATH | 400 | Path traversal detected |
| NOT_FOUND | 404 | Route doesn't exist |
| SERVICE_UNAVAILABLE | 503 | Service connection refused |
| SERVICE_NOT_FOUND | 503 | DNS resolution failed |
| GATEWAY_TIMEOUT | 504 | Service request timed out (30s) |
| BAD_GATEWAY | 502 | Service returned error |
| MISSING_TOKEN | 401 | Protected route, no token |

---

## 🧪 Testing

### Run Full Test Suite

```bash
chmod +x test-gateway.sh
./test-gateway.sh
```

Output:
```
🧪 CareerCraft API Gateway Test Suite
======================================

📡 Testing Gateway Endpoints
==============================
Testing: Gateway health check ... ✓ PASS (Status: 200)
Testing: Gateway status (all services) ... ✓ PASS (Status: 200)
Testing: Gateway information ... ✓ PASS (Status: 200)

📤 Testing Service Routing
===========================
Testing: Route to Auth Service - Signup ... ✓ PASS (Status: 200)
...

📊 Test Summary
===============
✓ Passed: 18
✗ Failed: 0

✅ All tests passed!
```

### Manual Tests

```bash
# Test health
curl http://localhost:3000/health

# Test service routing
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test with JWT token
curl http://localhost:3000/health \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test error handling
curl http://localhost:3000/invalid/path

# Test invalid content type
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: text/plain" \
  -d 'invalid'
```

---

## 🔧 Configuration

### Environment Variables

```env
# Server
PORT=3000                              # Gateway port
NODE_ENV=development                   # environment: development|production
LOG_LEVEL=debug                        # Log verbosity

# Security
JWT_SECRET=your_jwt_secret_key         # Secret for JWT signing
JWT_EXPIRE=7d                          # Token expiry time

# Services
AUTH_SERVICE_URL=http://localhost:3001
RESUME_SERVICE_URL=http://localhost:3002
AI_SERVICE_URL=http://localhost:8000
ROADMAP_SERVICE_URL=http://localhost:3003
ANALYTICS_SERVICE_URL=http://localhost:3004

# CORS
CORS_ORIGIN=http://localhost:5173      # Frontend URL

# Limits
MAX_REQUEST_SIZE=10485760              # 10MB
REQUEST_TIMEOUT=30000                  # 30 seconds
```

### Middleware Customization

Edit the middleware files to customize behavior:

| File | Purpose |
|------|---------|
| `middleware/logger.js` | Request logging format and output |
| `middleware/auth.js` | JWT verification and token handling |
| `middleware/validation.js` | Input validation and sanitization |
| `middleware/error.js` | Error handling and status codes |

---

## 📈 Monitoring

### Health Check Monitoring

Monitor gateway health periodically:

```bash
watch -n 5 'curl -s http://localhost:3000/status | jq .'
```

This command updates every 5 seconds with service status.

### Service Status Dashboard

Create a monitoring script:

```bash
#!/bin/bash
while true; do
  curl -s http://localhost:3000/status | jq .
  sleep 10
done
```

### Log Monitoring

```bash
# Monitor errors in real-time
tail -f logs/error.log | grep -i "error\|timeout\|unavailable"

# Count errors by service
grep -oh '"service":"[^"]*"' logs/error.log | sort | uniq -c

# Find slow requests (> 1 second)
grep " [1-9][0-9][0-9][0-9]ms " logs/access.log
```

---

## 🐛 Troubleshooting

### Gateway Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port 3000
kill -9 <PID>

# Check Node.js version
node --version  # Should be v18+

# Check dependencies
npm list
```

### Services Not Reachable

```bash
# Check if all services are running
curl http://localhost:3001/health   # Auth
curl http://localhost:3002/health   # Resume
curl http://localhost:8000/health   # AI
curl http://localhost:3003/health   # Roadmap
curl http://localhost:3004/health   # Analytics

# Check service URLs in .env
cat .env | grep SERVICE_URL

# Test connection manually
nc -zv localhost 3001
nc -zv localhost 3002
```

### JWT Token Issues

```bash
# Check if token is properly formatted
echo "<your_token>" | jq -R 'split(".") | .[0] | @base64d | fromjson'

# Verify token secret matches
# Check JWT_SECRET in .env file

# Test token verification
curl -H "Authorization: Bearer <invalid>" http://localhost:3000/health
# Should still work for public endpoints
```

### High Latency

```bash
# Check request timeout in gateway logs
tail logs/error.log | grep "GATEWAY_TIMEOUT"

# Increase REQUEST_TIMEOUT in .env if needed
# Default: 30000ms (30 seconds)

# Profile gateway performance
curl -w "Total: %{time_total}s\n" http://localhost:3000/health
```

---

## 📝 Development Tips

### Add New Service Route

1. Create route file in `src/routes/service-name.js`:

```javascript
import express from 'express';
import { proxyRequest } from '../controllers/proxy.js';

const router = express.Router();
router.use((req, res, next) => proxyRequest('service-name', req, res));
export default router;
```

2. Update `.env`:

```env
SERVICE_NAME_URL=http://localhost:PORT
```

3. Update `src/index.js`:

```javascript
import serviceRoutes from './routes/service-name.js';
app.use('/service-name', serviceRoutes);
```

### Custom Middleware

Create new middleware in `src/middleware/`:

```javascript
export const myMiddleware = (req, res, next) => {
  // Your logic here
  next();
};
```

Register in `src/index.js`:

```javascript
import { myMiddleware } from './middleware/my-middleware.js';
app.use(myMiddleware);
```

---

## 🌐 Production Deployment

### Environment Setup

```bash
# Create production .env
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>

# Disable logging to console, only files
LOG_LEVEL=error

# Update service URLs to production endpoints
AUTH_SERVICE_URL=https://auth.example.com
RESUME_SERVICE_URL=https://resume.example.com
# ... etc
```

### Build for Production

```bash
npm install --production
```

### Start in Production

```bash
node src/index.js
# Or use PM2
pm2 start src/index.js --name "gateway"
```

---

## 📄 License

MIT

---

## 🔗 Related Documentation

- [Phase 2 Summary](../PHASE_2_SUMMARY.md)
- [Project README](../README.md)
- [Auth Service](../services/auth-service)
- [Resume Service](../services/resume-service)

