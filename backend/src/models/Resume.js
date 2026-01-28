import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  
  // Extracted Fields (20+ fields)
  parsedData: {
    // Personal Information
    name: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String,
    portfolio: String,
    
    // Professional Summary
    summary: String,
    objective: String,
    
    // Education (array of education entries)
    education: [{
      institution: String,
      degree: String,
      field: String,
      graduationDate: String,
      gpa: String,
      achievements: [String]
    }],
    
    // Work Experience
    experience: [{
      company: String,
      position: String,
      duration: String,
      startDate: String,
      endDate: String,
      responsibilities: [String],
      achievements: [String]
    }],
    
    // Skills (categorized)
    skills: {
      technical: [String],
      soft: [String],
      tools: [String],
      languages: [String],
      frameworks: [String],
      databases: [String]
    },
    
    // Projects
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      link: String,
      duration: String
    }],
    
    // Certifications
    certifications: [{
      name: String,
      issuer: String,
      date: String,
      credentialId: String
    }],
    
    // Awards and Achievements
    awards: [String],
    
    // Publications
    publications: [{
      title: String,
      journal: String,
      date: String,
      link: String
    }],
    
    // Languages
    spokenLanguages: [{
      language: String,
      proficiency: String
    }],
    
    // Volunteer Experience
    volunteer: [{
      organization: String,
      role: String,
      duration: String,
      description: String
    }]
  },
  
  // AI Analysis Results
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  
  scoreBreakdown: {
    contentQuality: Number,
    skillRelevance: Number,
    experienceLevel: Number,
    educationAlignment: Number,
    formatting: Number,
    keywordMatch: Number,
    projectComplexity: Number,
    industryFit: Number,
    careerProgression: Number,
    certifications: Number
  },
  
  feedback: {
    strengths: [String],
    improvements: [String],
    suggestions: [String]
  },
  
  // Target job role for analysis
  targetRole: {
    type: String,
    default: 'Software Engineer'
  },
  
  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Resume', resumeSchema);
