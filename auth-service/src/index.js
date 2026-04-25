import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'Auth Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Placeholder routes
app.post('/signup', (req, res) => {
  res.status(200).json({ message: 'Signup endpoint (Phase 3)' });
});

app.post('/login', (req, res) => {
  res.status(200).json({ message: 'Login endpoint (Phase 3)' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Auth service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Auth Service is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});
