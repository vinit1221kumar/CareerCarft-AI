import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom morgan tokens
morgan.token('user-id', (req) => req.user?.id || 'anonymous');
morgan.token('service', (req) => req.targetService || 'gateway');
morgan.token('response-time-ms', (req, res) => {
  if (!res._header) return '';
  return res.getHeader('X-Response-Time') || '0';
});

// Combined format with custom tokens
const morganFormat = ':method :url :status :response-time[0]ms | User: :user-id | Service: :service | :res[content-length] bytes - :user-agent';

// Create write streams for different log levels
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a', encoding: 'utf-8' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a', encoding: 'utf-8' }
);

// Skip function to separate error logs
const skipSuccessLogs = (req, res) => res.statusCode < 400;
const skipAccessLogs = (req, res) => res.statusCode >= 400;

// Export middleware functions
export const requestLogger = morgan(morganFormat, { stream: accessLogStream, skip: skipAccessLogs });
export const errorLogger = morgan(morganFormat, { stream: errorLogStream, skip: skipSuccessLogs });
export const consoleLogger = morgan(morganFormat);

// Custom application logging
export const applicationLogger = (req, res, next) => {
  const startTime = Date.now();
  res.setHeader('X-Request-Start', String(startTime));
  
  // Store response time in header for morgan
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
      service: req.targetService || 'gateway',
      ip: req.ip
    };
    
    if (res.statusCode >= 400) {
      console.error('[ERROR]', JSON.stringify(logData));
    } else {
      console.log('[INFO]', JSON.stringify(logData));
    }
  });
  
  next();
};
