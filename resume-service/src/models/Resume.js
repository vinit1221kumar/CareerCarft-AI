import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1
    },
    fileFormat: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true
    },
    rawText: {
      type: String,
      required: true
    },
    metadata: {
      uploadedBy: {
        type: String,
        default: 'anonymous'
      },
      extractedPages: {
        type: Number,
        default: 1
      },
      textLength: {
        type: Number,
        default: 0
      },
      wordCount: {
        type: Number,
        default: 0
      }
    },
    status: {
      type: String,
      enum: ['processed', 'failed'],
      default: 'processed'
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

resumeSchema.index({ createdAt: -1 });
resumeSchema.index({ originalName: 1 });

export default mongoose.model('Resume', resumeSchema);
