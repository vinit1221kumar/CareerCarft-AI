import { generateInsights, getAdminInsights, getInsightsForUser } from '../services/analyticsService.js';

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

export const insights = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.body?.userId || 'anonymous';
    const resumeId = req.query.resumeId || req.body?.resumeId || null;
    const roadmapId = req.query.roadmapId || req.body?.roadmapId || null;
    const targetRole = req.query.targetRole || req.body?.targetRole || 'Software Engineer';
    const scope = req.query.scope || 'user';
    const currentSkills = normalizeList(req.query.currentSkills || req.body?.currentSkills);
    const targetSkills = normalizeList(req.query.targetSkills || req.body?.targetSkills);

    if (scope === 'admin') {
      const adminInsights = await getAdminInsights();
      return res.status(200).json({
        message: 'Admin insights retrieved successfully',
        data: adminInsights,
        timestamp: new Date().toISOString()
      });
    }

    if (!resumeId && !roadmapId && !req.query.userId && !req.body?.userId) {
      const storedInsights = await getInsightsForUser(userId);
      if (storedInsights.length) {
        return res.status(200).json({
          message: 'Stored insights retrieved successfully',
          data: storedInsights,
          timestamp: new Date().toISOString()
        });
      }
    }

    const generated = await generateInsights({
      userId,
      resumeId,
      roadmapId,
      targetRole,
      currentSkills,
      targetSkills,
      scope
    });

    return res.status(200).json({
      message: 'Insights generated successfully',
      data: generated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
};

export const health = (req, res) => {
  res.status(200).json({
    service: 'Analytics Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

export const status = (req, res) => {
  res.status(200).json({
    service: 'Analytics Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
