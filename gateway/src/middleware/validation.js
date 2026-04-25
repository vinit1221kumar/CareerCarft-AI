// Request validation middleware
export const validateContentType = (req, res, next) => {
  const allowMultipartRoutes = req.path.startsWith('/resume/upload');

  if (req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'HEAD' && !allowMultipartRoutes) {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Invalid Content-Type',
        message: 'Content-Type must be application/json',
        code: 'INVALID_CONTENT_TYPE',
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

// Request size limit middleware
export const validateRequestSize = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt(req.headers['content-length'] || '0');

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: `Request size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      code: 'PAYLOAD_TOO_LARGE',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Request sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters from query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        // Basic sanitization - remove script tags and SQL injection attempts
        req.query[key] = req.query[key]
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/['";\\]/g, '');
      }
    });
  }

  next();
};

// Request ID middleware - for tracing requests across services
export const addRequestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Route security middleware
export const validateRoute = (req, res, next) => {
  // Prevent path traversal attacks
  if (req.path.includes('..') || req.path.includes('//')) {
    return res.status(400).json({
      error: 'Invalid path',
      message: 'Path traversal detected',
      code: 'INVALID_PATH',
      timestamp: new Date().toISOString()
    });
  }

  next();
};
