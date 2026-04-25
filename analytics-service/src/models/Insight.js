import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, trim: true },
    currentLevel: { type: Number, default: 0, min: 0, max: 100 },
    targetLevel: { type: Number, default: 100, min: 0, max: 100 },
    gapScore: { type: Number, default: 0, min: 0, max: 100 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
  },
  { _id: false }
);

const insightSchema = new mongoose.Schema(
  {
    userId: { type: String, trim: true, index: true, default: 'anonymous' },
    resumeId: { type: String, trim: true, default: null },
    roadmapId: { type: String, trim: true, default: null },
    targetRole: { type: String, trim: true, default: 'Software Engineer' },
    currentSkills: [{ type: String, trim: true }],
    targetSkills: [{ type: String, trim: true }],
    skillGaps: [skillGapSchema],
    summary: { type: String, required: true },
    recommendations: [{ type: String, trim: true }],
    metrics: {
      resumeScore: { type: Number, default: 0 },
      roadmapReadiness: { type: Number, default: 0 },
      matchedSkills: { type: Number, default: 0 },
      missingSkills: { type: Number, default: 0 },
      contentQuality: { type: Number, default: 0 }
    },
    sourceData: {
      resumeName: { type: String, default: null },
      roadmapTitle: { type: String, default: null }
    },
    scope: { type: String, enum: ['user', 'admin'], default: 'user' },
    generatedBy: { type: String, default: 'analytics-engine' }
  },
  { timestamps: true, versionKey: false }
);

insightSchema.index({ userId: 1, createdAt: -1 });
insightSchema.index({ scope: 1, createdAt: -1 });

export default mongoose.model('Insight', insightSchema);
