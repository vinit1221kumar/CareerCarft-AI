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
