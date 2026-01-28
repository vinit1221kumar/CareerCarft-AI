import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetRole: {
    type: String,
    required: true,
    enum: ['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'Full Stack Developer']
  },
  
  // Skills analysis
  currentSkills: [String],
  requiredSkills: [String],
  missingSkills: [{
    skill: String,
    importance: {
      type: String,
      enum: ['critical', 'important', 'nice-to-have']
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'tool', 'framework', 'language']
    }
  }],
  matchingSkills: [String],
  
  // Gap Analysis Metrics
  overallMatch: {
    type: Number,
    min: 0,
    max: 100
  },
  skillCoverage: {
    technical: Number,
    soft: Number,
    tools: Number,
    frameworks: Number,
    languages: Number
  },
  
  // Embeddings for semantic matching
  skillEmbeddings: {
    type: Map,
    of: [Number] // Vector embeddings
  },
  
  recommendations: [{
    skill: String,
    reason: String,
    resources: [String],
    estimatedTime: String,
    priority: Number
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SkillGap', skillGapSchema);
