import { registerUser, loginUser } from '../services/authService.js';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim().toLowerCase());

const validateSignupPayload = ({ name, email, password }) => {
  if (!name || !email || !password) {
    return 'Name, email, and password are required';
  }

  if (String(name).trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }

  if (!isValidEmail(email)) {
    return 'Please provide a valid email address';
  }

  if (String(password).length < 8) {
    return 'Password must be at least 8 characters long';
  }

  return null;
};

const validateLoginPayload = ({ email, password }) => {
  if (!email || !password) {
    return 'Email and password are required';
  }

  if (!isValidEmail(email)) {
    return 'Please provide a valid email address';
  }

  return null;
};

export const signup = async (req, res, next) => {
  try {
    const validationError = validateSignupPayload(req.body || {});
    if (validationError) {
      return res.status(400).json({
        error: validationError,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const result = await registerUser(req.body);

    return res.status(201).json({
      message: 'User registered successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validationError = validateLoginPayload(req.body || {});
    if (validationError) {
      return res.status(400).json({
        error: validationError,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const result = await loginUser(req.body);

    return res.status(200).json({
      message: 'Login successful',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
};

export const health = (req, res) => {
  res.status(200).json({
    service: 'Auth Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
