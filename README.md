# CareerCraft AI - Resume Analyzer & Career Roadmap Platform


## Overview
A comprehensive AI-powered platform for resume analysis, skill gap identification, and personalized career roadmap generation. Built with the MERN stack and powered by HuggingFace AI models.

## Technologies
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, TanStack Query, Recharts
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI/ML**: HuggingFace Embeddings & LLMs, Natural NLP, Compromise
- **Authentication**: JWT, bcryptjs
- **File Processing**: pdf-parse, mammoth
- **Timeline**: January 2025 – April 2025

## Key Features

### 1. Resume Parsing 📄
- Extract **20+ fields** (skills, experience, projects, education) from resumes
- Support for **PDF and DOCX** formats
- NLP-based intelligent text extraction
- Automatic categorization of skills (technical, frameworks, languages, tools, databases)

### 2. AI Scoring 🎯
- Score resumes across **10+ criteria** (Content Quality, Skill Relevance, Experience Level, etc.)
- Generate **1-100 scale reports** with detailed feedback
- Identify strengths, areas for improvement, and actionable suggestions
- HuggingFace LLM-powered analysis with fallback rule-based scoring

### 3. Skill Gap Analysis 📊
- Map **300+ skills** across **5 major job roles**:
  - Software Engineer
  - Data Scientist
  - Product Manager
  - DevOps Engineer
  - Full Stack Developer
- Semantic skill matching using vector embeddings
- Calculate skill coverage by category (Languages, Frameworks, Tools, etc.)
- Priority-based skill recommendations

### 4. Roadmap Generator 🗺️
- Produce **4-8 week** custom learning roadmaps
- **40+ learning milestones** per roadmap
- Organized by weekly themes with specific objectives
- Includes resources, practice exercises, and assessments
- Progress tracking with milestone completion
- Capstone project recommendations

### 5. Admin Dashboard 📈
- Aggregate analytics across **100+ reports**
- Identify **top 10 common skill gaps**
- Role-specific analytics with average scores
- Score distribution visualization
- Common strengths and improvement areas
- Data visualization with interactive charts

## Project Structure
```
CareerCraft AI/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers (auth, resume, admin)
│   │   ├── middleware/     # Auth & upload middleware
│   │   ├── models/         # MongoDB schemas (User, Resume, SkillGap, Roadmap, AdminReport)
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic (parser, AI, skill analysis, roadmap)
│   ├── uploads/            # Resume file storage
│   ├── server.js           # Express server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Dashboard, Upload, Resume, etc.)
│   │   ├── services/       # API service layer
│   │   ├── store/          # Zustand state management
│   │   ├── App.jsx         # Main app with routing
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── README.md
└── SETUP.md               # Detailed setup instructions
```

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- HuggingFace API Key

### Backend Setup
```powershell
cd "Z:\CareerCraft AI\backend"
npm install
# Create .env file (see .env.example)
npm run dev
```

### Frontend Setup
```powershell
cd "Z:\CareerCraft AI\frontend"
npm install
npm run dev
```

Visit http://localhost:5173 to access the application.

For detailed setup instructions, see [SETUP.md](SETUP.md)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Resumes
- `POST /api/resumes/upload` - Upload & parse resume
- `GET /api/resumes` - Get all user resumes
- `GET /api/resumes/:id` - Get resume details
- `POST /api/resumes/analyze-skill-gap` - Analyze skill gaps
- `POST /api/resumes/generate-roadmap` - Generate learning roadmap
- `GET /api/resumes/roadmap/:id` - Get roadmap
- `PUT /api/resumes/roadmap/:id/progress` - Update milestone progress

### Admin (requires admin role)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/skill-gaps` - Top 10 skill gaps
- `GET /api/admin/dashboard/role-analytics` - Role-based analytics
- `GET /api/admin/reports/generate` - Generate comprehensive report

## Features Walkthrough

### For Students
1. **Register/Login** - Create your account
2. **Upload Resume** - Submit PDF/DOCX resume with target role
3. **View Analysis** - Get instant score and detailed breakdown
4. **Skill Gap Analysis** - See what skills you need to learn
5. **Generate Roadmap** - Get personalized 4-8 week learning plan
6. **Track Progress** - Mark milestones as complete

### For Admins
1. **Dashboard Overview** - View aggregate statistics
2. **Skill Gap Insights** - Identify common missing skills
3. **Role Analytics** - Compare performance across job roles
4. **Trend Analysis** - Track common strengths and weaknesses
5. **Report Generation** - Export comprehensive analytics

## Technical Highlights

- **Semantic Matching**: Uses HuggingFace sentence-transformers for intelligent skill matching
- **Scalable Architecture**: Modular service-based backend design
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Type-safe API**: Comprehensive error handling and validation
- **Responsive Design**: Mobile-friendly with dark mode support
- **Progress Tracking**: Persistent state management with Zustand
- **Data Visualization**: Interactive charts with Recharts

## Future Enhancements

- [ ] Email notifications for completed analysis
- [ ] Cloud storage integration (AWS S3/Azure Blob)
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Additional job roles and skills
- [ ] Resume templates and builder
- [ ] Video tutorials for roadmaps
- [ ] Multi-language support

## Contributing

This project was developed as part of a portfolio showcase. Feel free to fork and customize for your needs.

## License

MIT License - feel free to use this project for learning and development.

## Contact

For questions or suggestions, please open an issue on the repository.

---

**Built with ❤️ using React, Node.js, MongoDB, and HuggingFace AI**
=======
**Production-Grade Microservices Architecture**

## 📋 Project Structure

```
careercraft/
├── gateway/                    # API Gateway (Node.js + Express)
├── services/
│   ├── auth-service/          # Authentication (JWT, bcrypt)
│   ├── resume-service/        # Resume processing (PDF/DOCX parsing)
│   ├── ai-service/            # AI analysis (FastAPI + HuggingFace)
│   ├── roadmap-service/       # Career roadmap generation
│   └── analytics-service/     # Analytics & insights
├── frontend/                  # React + Vite UI
├── docker-compose.yml         # Docker orchestration
└── .env                        # Environment configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- MongoDB (local or Atlas)

### Installation

1. **Install dependencies for all services:**

```bash
# Gateway
cd gateway && npm install && cd ..

# Auth Service
cd services/auth-service && npm install && cd ../../

# Resume Service
cd services/resume-service && npm install && cd ../../

# Roadmap Service
cd services/roadmap-service && npm install && cd ../../

# Analytics Service
cd services/analytics-service && npm install && cd ../../

# AI Service (Python)
cd services/ai-service && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ../../
```

2. **Start all services:**

```bash
# Terminal 1: Gateway
cd gateway && npm run dev

# Terminal 2: Auth Service
cd services/auth-service && npm run dev

# Terminal 3: Resume Service
cd services/resume-service && npm run dev

# Terminal 4: Roadmap Service
cd services/roadmap-service && npm run dev

# Terminal 5: Analytics Service
cd services/analytics-service && npm run dev

# Terminal 6: AI Service
cd services/ai-service && source venv/bin/activate && python main.py
```

## 📝 PHASE 1 Completion

✅ **Folder Structure Created**
- All service directories initialized
- MVC pattern structure in place

✅ **Dependencies Configured**
- package.json for all Node services
- requirements.txt for Python AI service

✅ **Environment Variables**
- .env files for each service with proper configuration

✅ **Basic Servers**
- Express servers for Node services
- FastAPI server for AI service
- Health check endpoints for all services

✅ **Health Endpoints**
- GET /health - Check individual service health
- GET /status - Check all services status (Gateway only)

## 🔌 Service Ports

| Service | Port | Type |
|---------|------|------|
| Gateway | 3000 | Node.js |
| Auth | 3001 | Node.js |
| Resume | 3002 | Node.js |
| Roadmap | 3003 | Node.js |
| Analytics | 3004 | Node.js |
| AI Service | 8000 | Python |

## ✂️ Testing Health Check

```bash
# Gateway health
curl http://localhost:3000/health

# Gateway status (all services)
curl http://localhost:3000/status

# Individual service health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:8000/health
```

## 📚 Environment Variables

Each service has a `.env` file with the following configuration:
- `PORT` - Service port
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string (use your Atlas SRV URI)
- Service URLs for inter-service communication

## 🎯 Next Steps

- **PHASE 2**: Implement API Gateway routing and middleware
- **PHASE 3**: Implement Auth Service (signup/login)
- **PHASE 4**: Implement Resume Service (file upload/parsing)
- **PHASE 5**: Implement AI Service (resume analysis)
- **PHASE 6**: Implement Roadmap Service
- **PHASE 7**: Implement Analytics Service
- **PHASE 8**: Database integration with MongoDB
- **PHASE 9**: Inter-service communication
- **PHASE 10**: Dockerization
- **PHASE 11**: Frontend implementation
- **PHASE 12**: Deployment configuration

## 📖 Documentation

More detailed documentation for each service will be added as phases are completed.

## 🚢 Deployment (Phase 12)

### Frontend (Vercel)

Frontend deployment is prepared in [frontend/vercel.json](frontend/vercel.json).

1. Import the `frontend` directory as a Vercel project.
2. Set environment variable:
	- `VITE_API_BASE_URL=https://<your-gateway-public-url>`
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (Render)

Backend deployment blueprint is prepared in [render.yaml](render.yaml).

1. Create a Render Blueprint from repository root.
2. Render will provision:
	- `careercraft-gateway`
	- `careercraft-auth-service`
	- `careercraft-resume-service`
	- `careercraft-ai-service`
	- `careercraft-roadmap-service`
	- `careercraft-analytics-service`
3. Set secret env vars in Render dashboard:
	- `MONGODB_URI`
	- `JWT_SECRET`
	- `LLM_API_KEY`
	- `LLM_API_URL`
4. Update inter-service URLs to each Render public URL.

### MongoDB Atlas

Use [/.env.production.example](.env.production.example) as the base for production env mapping.

Required Atlas setup:

1. Create cluster and database users.
2. Allow platform egress IPs (Render) or temporarily allow all for testing.
3. Set `MONGODB_URI` in each backend service.

### Production Build Steps

- Frontend: `cd frontend && npm install && npm run build`
- Node services: `npm install && npm start`
- AI service: `pip install -r requirements.txt && uvicorn main:app --host 0.0.0.0 --port $PORT`

## 📄 License

MIT

