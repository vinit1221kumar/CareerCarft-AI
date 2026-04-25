import { requestWithRetry } from '../services/httpClient.js';

// Service configuration
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  resume: process.env.RESUME_SERVICE_URL || 'http://localhost:3002',
  ai: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  roadmap: process.env.ROADMAP_SERVICE_URL || 'http://localhost:3003',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004'
};

const SERVICE_TIMEOUT = 30000; // 30 seconds

// Health check for services
export const checkServiceHealth = async (serviceName) => {
  try {
    const url = `${SERVICES[serviceName]}/health`;
    const startedAt = Date.now();
    const response = await requestWithRetry({ method: 'get', url, timeout: 5000, retries: 1 });
    return { healthy: response.status === 200, responseTime: Date.now() - startedAt };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

// Proxy request to service
export const proxyRequest = async (serviceName, req, res) => {
  try {
    req.targetService = serviceName;
    const startedAt = Date.now();
    
    const serviceUrl = SERVICES[serviceName];
    if (!serviceUrl) {
      return res.status(503).json({
        error: 'Service not configured',
        service: serviceName,
        code: 'SERVICE_NOT_CONFIGURED',
        timestamp: new Date().toISOString()
      });
    }

    // Build full URL for the service and preserve query string
    const forwardedPath = req.originalUrl.slice(req.baseUrl.length) || req.path;
    const targetUrl = `${serviceUrl}${forwardedPath}`;

    // Prepare request headers
    const headers = {
      ...req.headers,
      'X-Request-ID': req.id,
      'X-Forwarded-For': req.ip,
      'X-Forwarded-Proto': req.protocol,
      'X-Forwarded-Host': req.hostname
    };

    // Remove host header to avoid conflicts
    delete headers.host;

    // Make request to service
    const response = await requestWithRetry({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers,
      timeout: SERVICE_TIMEOUT,
      retries: Number.parseInt(process.env.GATEWAY_RETRY_ATTEMPTS || '2', 10)
    });

    // Add custom headers to response
    res.set('X-Service', serviceName);
    res.set('X-Response-Time', String(Date.now() - startedAt));

    // Send response
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(`[PROXY_ERROR] Service: ${serviceName}, Error:`, {
      message: error.message,
      code: error.code,
      path: req.path
    });

    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service unavailable',
        service: serviceName,
        code: 'SERVICE_UNAVAILABLE',
        message: `Cannot connect to ${serviceName} service`,
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Service not found',
        service: serviceName,
        code: 'SERVICE_NOT_FOUND',
        message: `${serviceName} service DNS resolution failed`,
        timestamp: new Date().toISOString()
      });
    }

    if (error.code === 'ETIMEDOUT' || error.message === 'timeout of ' + SERVICE_TIMEOUT + 'ms exceeded') {
      return res.status(504).json({
        error: 'Gateway timeout',
        service: serviceName,
        code: 'GATEWAY_TIMEOUT',
        message: `Request to ${serviceName} service timed out`,
        timeout: SERVICE_TIMEOUT,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(502).json({
      error: 'Bad gateway',
      service: serviceName,
      code: 'BAD_GATEWAY',
      message: error.message,
      retryable: true,
      timestamp: new Date().toISOString()
    });
  }
};
