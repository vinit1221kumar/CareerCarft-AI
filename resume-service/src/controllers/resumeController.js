import fs from 'fs/promises';
import path from 'path';
import { createUploadDirectory, extractResumeText, getResumeById, storeResume, validateResumeFile } from '../services/resumeService.js';

export const uploadResume = async (req, res, next) => {
  let uploadedFilePath = null;

  try {
    const file = req.file;
    const fileFormat = validateResumeFile(file);
    uploadedFilePath = file.path;

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await createUploadDirectory(uploadDir);

    const { text, extractedPages } = await extractResumeText(file.path, fileFormat);

    if (!text || !text.trim()) {
      const error = new Error('Unable to extract text from the uploaded file');
      error.statusCode = 422;
      error.code = 'TEXT_EXTRACTION_FAILED';
      throw error;
    }

    const resume = await storeResume({
      fileName: path.basename(file.path),
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileFormat,
      rawText: text,
      extractedPages,
      uploadedBy: req.body?.uploadedBy || req.headers['x-user-id'] || 'anonymous'
    });

    return res.status(201).json({
      message: 'Resume uploaded and processed successfully',
      data: {
        id: resume._id,
        originalName: resume.originalName,
        fileFormat: resume.fileFormat,
        fileSize: resume.fileSize,
        metadata: resume.metadata,
        createdAt: resume.createdAt
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup uploaded file:', cleanupError.message);
      }
    }
    return next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await getResumeById(id);

    if (!resume) {
      return res.status(404).json({
        error: 'Resume not found',
        code: 'RESUME_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      message: 'Resume retrieved successfully',
      data: resume,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
};

export const health = (req, res) => {
  res.status(200).json({
    service: 'Resume Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

export const status = (req, res) => {
  res.status(200).json({
    service: 'Resume Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
