import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

// Import middleware
import { requestLogger, errorLogger, consoleLogger, applicationLogger } from './middleware/logger.js';
import { verifyToken, tokenRefresh } from './middleware/auth.js';
import { 
  validateContentType, 
  validateRequestSize, 
  sanitizeInput, 
  addRequestId, 
  validateRoute 
} from './middleware/validation.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

// Import routes
import gatewayRoutes from './routes/gateway.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import aiRoutes from './routes/ai.js';
import roadmapRoutes from './routes/roadmap.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== Core Middleware ====================

// CORS
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request ID
app.use(addRequestId);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==================== Logging Middleware ====================
if (process.env.NODE_ENV !== 'production') {
  app.use(consoleLogger);
}
app.use(applicationLogger);
app.use(requestLogger);
app.use(errorLogger);

// ==================== Validation & Security Middleware ====================
app.use(validateRoute);
app.use(validateContentType);
app.use(validateRequestSize);
app.use(sanitizeInput);

// ==================== Authentication Middleware ====================
app.use(verifyToken);
app.use(tokenRefresh);

// ==================== Routes ====================

// Gateway routes (health, status, info)
app.use('/', gatewayRoutes);

// Service routes
app.use('/auth', authRoutes);
app.use('/resume', resumeRoutes);
app.use('/ai', aiRoutes);
app.use('/roadmap', roadmapRoutes);
app.use('/analytics', analyticsRoutes);

// ==================== Error Handling ====================

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ==================== Server Startup ====================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 API Gateway is running           ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
║   PID: ${process.pid}                          ║
╚════════════════════════════════════════╝
  `);

  // Log service configuration
  console.log('\n📍 Service Configuration:');
  console.log(`   Auth Service: ${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}`);
  console.log(`   Resume Service: ${process.env.RESUME_SERVICE_URL || 'http://localhost:3002'}`);
  console.log(`   AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  console.log(`   Roadmap Service: ${process.env.ROADMAP_SERVICE_URL || 'http://localhost:3003'}`);
  console.log(`   Analytics Service: ${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004'}`);

  // Log routes
  console.log('\n🔌 Available Routes:');
  console.log('   GET  /health      - Gateway health check');
  console.log('   GET  /status      - All services status');
  console.log('   GET  /info        - Gateway information');
  console.log('   *    /auth        - Auth service routes');
  console.log('   *    /resume      - Resume service routes');
  console.log('   *    /ai          - AI service routes');
  console.log('   *    /roadmap     - Roadmap service routes');
  console.log('   *    /analytics   - Analytics service routes');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
