import { checkServiceHealth } from './proxy.js';

// Gateway health status
export const getGatewayHealth = (req, res) => {
  res.status(200).json({
    service: 'API Gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
};

// Check all services health status
export const getAllServicesStatus = async (req, res) => {
  try {
    const serviceNames = ['auth', 'resume', 'ai', 'roadmap', 'analytics'];
    const serviceStatuses = {};

    // Check health of all services in parallel
    const healthChecks = serviceNames.map(async (serviceName) => {
      const health = await checkServiceHealth(serviceName);
      serviceStatuses[serviceName] = health.healthy;
      return { service: serviceName, ...health };
    });

    await Promise.all(healthChecks);

    const allHealthy = Object.values(serviceStatuses).every(status => status === true);

    return res.status(allHealthy ? 200 : 503).json({
      gateway: 'healthy',
      overall_status: allHealthy ? 'operational' : 'degraded',
      services: serviceStatuses,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('[STATUS_CHECK_ERROR]', error);
    return res.status(500).json({
      error: 'Failed to check service status',
      code: 'STATUS_CHECK_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// Get gateway information
export const getGatewayInfo = (req, res) => {
  res.status(200).json({
    name: 'CareerCraft API Gateway',
    version: '1.0.0',
    description: 'Central API Gateway for CareerCraft microservices',
    environment: process.env.NODE_ENV || 'development',
    services: {
      auth: '/auth',
      resume: '/resume',
      ai: '/ai',
      roadmap: '/roadmap',
      analytics: '/analytics'
    },
    endpoints: {
      health: 'GET /health',
      status: 'GET /status',
      info: 'GET /info'
    },
    timestamp: new Date().toISOString()
  });
};
