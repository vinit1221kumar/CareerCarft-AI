import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, getDatabaseStatus } from './config/database.js';
import resumeRoutes from './routes/resumeRoutes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;
const uploadDir = path.resolve(__dirname, '../', process.env.UPLOAD_DIR || './uploads');

await fs.mkdir(uploadDir, { recursive: true });

app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Resume Service',
    status: 'healthy',
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/', resumeRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Resume service error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        code: 'FILE_TOO_LARGE',
        timestamp: new Date().toISOString()
      });
    }
  }

  return res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Resume Service is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start Resume Service:', error.message);
    process.exit(1);
  }
};

startServer();
