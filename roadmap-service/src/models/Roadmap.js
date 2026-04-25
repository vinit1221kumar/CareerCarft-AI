import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    week: { type: Number, required: true, min: 1, max: 12 },
    title: { type: String, required: true, trim: true },
    objectives: [{ type: String, trim: true }],
    resources: [{ type: String, trim: true }],
    deliverables: [{ type: String, trim: true }],
    estimatedHours: { type: Number, default: 10, min: 1 }
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true, index: true },
    targetRole: { type: String, required: true, trim: true },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    durationWeeks: { type: Number, required: true, min: 4, max: 8 },
    currentSkills: [{ type: String, trim: true }],
    targetSkills: [{ type: String, trim: true }],
    focusAreas: [{ type: String, trim: true }],
    roadmapTitle: { type: String, required: true },
    roadmapSummary: { type: String, required: true },
    prompt: { type: String, required: true },
    generatedBy: { type: String, default: 'llm-fallback' },
    milestones: [milestoneSchema],
    recommendations: [{ type: String, trim: true }],
    sourceData: {
      resumeId: { type: String, default: null },
      aiAnalyzed: { type: Boolean, default: false }
    },
    status: { type: String, enum: ['generated', 'saved'], default: 'generated' }
  },
  { timestamps: true, versionKey: false }
);

roadmapSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Roadmap', roadmapSchema);
