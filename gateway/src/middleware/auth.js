import jwt from 'jsonwebtoken';

// Middleware to verify JWT token (optional, for protected routes)
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // Token not provided - proceed without validation
    // Some routes don't require auth (e.g., signup, login, health check)
    req.user = null;
    return next();
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_in_production');
    req.user = decoded;
    req.token = token;
  } catch (error) {
    console.warn('Invalid token provided:', error.message);
    req.user = null;
    // Don't fail here - let individual services handle token validation
  }

  next();
};

// Middleware to enforce token requirement for protected routes
export const requireToken = (req, res, next) => {
  if (!req.token) {
    return res.status(401).json({
      error: 'Unauthorized: Token required',
      code: 'MISSING_TOKEN',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Middleware to refresh token if needed (optional)
export const tokenRefresh = (req, res, next) => {
  // This middleware can check if token is near expiry and refresh it
  // To be used in later phases
  if (req.user && req.user.exp) {
    const expiryTime = req.user.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;

    // If token expires in less than 5 minutes, prepare refresh
    if (timeUntilExpiry < 5 * 60 * 1000) {
      req.tokenNeedsRefresh = true;
    }
  }

  next();
};
