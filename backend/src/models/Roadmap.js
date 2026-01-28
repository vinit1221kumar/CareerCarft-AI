import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  skillGapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillGap',
    required: true
  },
  targetRole: {
    type: String,
    required: true
  },
  
  // Roadmap duration
  duration: {
    weeks: {
      type: Number,
      min: 4,
      max: 8,
      default: 6
    },
    hoursPerWeek: {
      type: Number,
      default: 10
    }
  },
  
  // Learning path organized by weeks
  weeks: [{
    weekNumber: Number,
    theme: String,
    objectives: [String],
    milestones: [{
      title: String,
      description: String,
      category: {
        type: String,
        enum: ['skill', 'project', 'certification', 'reading', 'practice']
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low']
      },
      estimatedHours: Number,
      resources: [{
        title: String,
        type: String, // video, article, course, documentation
        url: String,
        duration: String
      }],
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started'
      },
      completedAt: Date
    }],
    assessments: [{
      type: String,
      description: String,
      link: String
    }]
  }],
  
  // Overall progress tracking
  progress: {
    completedMilestones: {
      type: Number,
      default: 0
    },
    totalMilestones: Number,
    percentComplete: {
      type: Number,
      default: 0
    },
    currentWeek: {
      type: Number,
      default: 1
    }
  },
  
  // Final project/capstone
  capstoneProject: {
    title: String,
    description: String,
    technologies: [String],
    estimatedHours: Number,
    milestones: [String]
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

roadmapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate total milestones
  let total = 0;
  this.weeks.forEach(week => {
    total += week.milestones.length;
  });
  this.progress.totalMilestones = total;
  
  // Calculate percent complete
  if (total > 0) {
    this.progress.percentComplete = Math.round((this.progress.completedMilestones / total) * 100);
  }
  
  next();
});

export default mongoose.model('Roadmap', roadmapSchema);
