import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Resume from '../models/Resume.js';

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx'];

export const createUploadDirectory = async (uploadDir) => {
  await fs.mkdir(uploadDir, { recursive: true });
};

export const getFileFormat = (fileName = '') => {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.pdf') return 'pdf';
  if (ext === '.docx') return 'docx';
  return null;
};

export const extractResumeText = async (filePath, fileFormat) => {
  const fileBuffer = await fs.readFile(filePath);

  if (fileFormat === 'pdf') {
    const parsed = await pdfParse(fileBuffer);
    return {
      text: parsed.text || '',
      extractedPages: parsed.numpages || 1
    };
  }

  if (fileFormat === 'docx') {
    const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
    return {
      text: parsed.value || '',
      extractedPages: 1
    };
  }

  throw new Error('Unsupported file format');
};

export const storeResume = async ({
  fileName,
  originalName,
  mimeType,
  fileSize,
  fileFormat,
  rawText,
  extractedPages,
  uploadedBy = 'anonymous'
}) => {
  const cleanText = String(rawText || '').trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;

  return Resume.create({
    fileName,
    originalName,
    mimeType,
    fileSize,
    fileFormat,
    rawText: cleanText,
    metadata: {
      uploadedBy,
      extractedPages,
      textLength: cleanText.length,
      wordCount
    },
    status: 'processed'
  });
};

export const getResumeById = async (id) => {
  return Resume.findById(id).lean();
};

export const validateResumeFile = (file) => {
  if (!file) {
    const error = new Error('Resume file is required');
    error.statusCode = 400;
    error.code = 'FILE_REQUIRED';
    throw error;
  }

  const fileFormat = getFileFormat(file.originalname);
  if (!fileFormat || !SUPPORTED_EXTENSIONS.includes(path.extname(file.originalname).toLowerCase())) {
    const error = new Error('Only PDF and DOCX files are supported');
    error.statusCode = 400;
    error.code = 'UNSUPPORTED_FILE_TYPE';
    throw error;
  }

  return fileFormat;
};
