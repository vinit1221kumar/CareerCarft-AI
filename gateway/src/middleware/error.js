// Custom error class for API errors
export class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  const errorResponse = {
    error: {
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown',
      path: req.path
    }
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  console.error('[ERROR_HANDLER]', {
    statusCode,
    code,
    message,
    path: req.path,
    method: req.method,
    requestId: req.id
  });

  res.status(statusCode).json(errorResponse);
};

// Async route wrapper to catch errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
export const notFoundHandler = (req, res, next) => {
  const error = new APIError(
    `Route not found: ${req.method} ${req.path}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};
