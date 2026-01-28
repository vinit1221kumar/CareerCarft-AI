import mongoose from 'mongoose';

const adminReportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['aggregate', 'cohort', 'periodic'],
    default: 'aggregate'
  },
  
  // Time period for the report
  period: {
    startDate: Date,
    endDate: Date
  },
  
  // Aggregate statistics
  statistics: {
    totalResumesProcessed: {
      type: Number,
      default: 0
    },
    totalUsers: {
      type: Number,
      default: 0
    },
    averageScore: Number,
    medianScore: Number,
    
    // Score distribution
    scoreDistribution: {
      excellent: Number,    // 90-100
      good: Number,         // 75-89
      average: Number,      // 60-74
      belowAverage: Number, // 40-59
      poor: Number          // 0-39
    }
  },
  
  // Top 10 skill gaps (most common missing skills)
  topSkillGaps: [{
    skill: String,
    category: String,
    frequency: Number,      // How many students are missing this
    percentage: Number,     // Percentage of total students
    targetRoles: [String]   // Which roles require this skill
  }],
  
  // Role-specific analytics
  roleAnalytics: [{
    role: String,
    count: Number,
    averageScore: Number,
    topMissingSkills: [String],
    averageSkillMatch: Number
  }],
  
  // Common strengths across all resumes
  commonStrengths: [{
    strength: String,
    frequency: Number,
    percentage: Number
  }],
  
  // Common areas for improvement
  commonImprovements: [{
    area: String,
    frequency: Number,
    percentage: Number
  }],
  
  // Roadmap analytics
  roadmapAnalytics: {
    totalRoadmapsGenerated: Number,
    averageCompletionRate: Number,
    popularMilestones: [{
      milestone: String,
      frequency: Number
    }]
  },
  
  // Trending skills
  trendingSkills: [{
    skill: String,
    trend: String, // 'increasing', 'decreasing', 'stable'
    changePercentage: Number
  }],
  
  // Educational background distribution
  educationStats: {
    degreeTypes: Map,
    fieldsOfStudy: Map,
    gpaDistribution: {
      high: Number,    // >= 3.5
      medium: Number,  // 3.0-3.49
      low: Number      // < 3.0
    }
  },
  
  // Experience level distribution
  experienceStats: {
    noExperience: Number,
    juniorLevel: Number,    // 0-2 years
    midLevel: Number,       // 3-5 years
    seniorLevel: Number     // 6+ years
  },
  
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

export default mongoose.model('AdminReport', adminReportSchema);
