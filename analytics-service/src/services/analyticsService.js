import { getWithRetry } from './httpClient.js';
import Insight from '../models/Insight.js';

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

const ANALYTICS_SKILLS = [
  'python', 'javascript', 'typescript', 'react', 'node', 'node.js', 'express', 'fastapi',
  'mongodb', 'sql', 'postgresql', 'mysql', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
  'system design', 'microservices', 'rest api', 'graphql', 'machine learning', 'nlp',
  'pytorch', 'tensorflow', 'pandas', 'numpy', 'ci/cd', 'testing', 'jest', 'pytest', 'git'
];

const computeSkills = (text) => {
  const lower = String(text || '').toLowerCase();
  return ANALYTICS_SKILLS.filter((skill) => lower.includes(skill));
};

const unique = (list) => [...new Set((list || []).map((item) => String(item).trim()).filter(Boolean))];

const priorityForGap = (gapScore) => {
  if (gapScore >= 70) return 'high';
  if (gapScore >= 40) return 'medium';
  return 'low';
};

const scoreTextQuality = (text) => {
  const wordCount = String(text || '').split(/\s+/).filter(Boolean).length;
  const hasEmail = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(text || '');
  const hasPhone = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/.test(text || '');
  const hasSections = ['experience', 'education', 'skills', 'projects'].filter((section) => (text || '').toLowerCase().includes(section)).length;

  let score = 0;
  if (wordCount > 100) score += 25;
  if (wordCount > 250) score += 15;
  if (hasEmail) score += 20;
  if (hasPhone) score += 20;
  score += hasSections * 10;
  return Math.min(score, 100);
};

const fetchJSON = async (url) => {
  try {
    return await getWithRetry(url, { timeout: 10000 });
  } catch (error) {
    console.warn(`Upstream fetch failed for ${url}:`, error.message);
    return null;
  }
};

const fetchResumeById = async (resumeId) => {
  if (!resumeId || !process.env.RESUME_SERVICE_URL) return null;
  const data = await fetchJSON(`${process.env.RESUME_SERVICE_URL}/resume/${resumeId}`);
  return data?.data || null;
};

const fetchLatestRoadmapForUser = async (userId) => {
  if (!userId || !process.env.ROADMAP_SERVICE_URL) return null;
  const data = await fetchJSON(`${process.env.ROADMAP_SERVICE_URL}/latest/${userId}`);
  return data?.data || null;
};

const fetchRoadmapById = async (roadmapId) => {
  if (!roadmapId || !process.env.ROADMAP_SERVICE_URL) return null;
  const data = await fetchJSON(`${process.env.ROADMAP_SERVICE_URL}/${roadmapId}`);
  return data?.data || null;
};

const buildSkillGaps = (currentSkills, targetSkills, resumeText, roadmap) => {
  const current = unique(currentSkills.length ? currentSkills : computeSkills(resumeText));
  const target = unique(targetSkills.length ? targetSkills : (roadmap?.milestones || []).flatMap((m) => m.objectives || []).map((item) => String(item)));
  const matched = current.filter((skill) => target.some((t) => t.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(t.toLowerCase())));
  const missing = target.filter((skill) => !current.some((cur) => cur.toLowerCase() === skill.toLowerCase() || skill.toLowerCase().includes(cur.toLowerCase())));

  return missing.slice(0, 12).map((skill) => {
    const gapScore = Math.min(100, 100 - (matched.length * 10));
    return {
      skill,
      currentLevel: matched.some((m) => skill.toLowerCase().includes(m.toLowerCase())) ? 50 : 0,
      targetLevel: 100,
      gapScore,
      priority: priorityForGap(gapScore)
    };
  });
};

const buildRecommendations = ({ skillGaps, resumeScore, roadmapReadiness, targetRole }) => {
  const recommendations = [];
  if (skillGaps.length) {
    recommendations.push(`Focus on the top ${Math.min(3, skillGaps.length)} skill gaps for the ${targetRole} track`);
  }
  if (resumeScore < 70) {
    recommendations.push('Improve resume structure, keywords, and measurable outcomes');
  }
  if (roadmapReadiness < 60) {
    recommendations.push('Use the roadmap to build one portfolio project per milestone');
  }
  recommendations.push('Track weekly progress and update the resume after each completed milestone');
  recommendations.push('Add evidence of impact, metrics, and links to projects');
  return recommendations.slice(0, 6);
};

export const generateInsights = async ({ userId, resumeId, roadmapId, targetRole, currentSkills, targetSkills, scope = 'user' }) => {
  const resume = await fetchResumeById(resumeId);
  const roadmap = roadmapId ? await fetchRoadmapById(roadmapId) : await fetchLatestRoadmapForUser(userId);
  const resumeText = resume?.rawText || '';
  const roadmapTitle = roadmap?.roadmapTitle || null;
  const roadmapSkills = roadmap?.targetSkills || roadmap?.recommendations || [];

  const normalizedCurrent = unique(normalizeList(currentSkills).length ? normalizeList(currentSkills) : (resume?.metadata?.skills || []));
  const normalizedTarget = unique(normalizeList(targetSkills).length ? normalizeList(targetSkills) : roadmapSkills);

  const resumeSkills = computeSkills(resumeText);
  const mergedCurrent = unique([...normalizedCurrent, ...resumeSkills]);
  const skillGaps = buildSkillGaps(mergedCurrent, normalizedTarget, resumeText, roadmap);
  const resumeScore = resume?.metadata?.textLength ? Math.min(100, Math.round((resume.metadata.textLength / 2500) * 100)) : scoreTextQuality(resumeText);
  const roadmapReadiness = roadmap?.milestones?.length ? Math.min(100, roadmap.milestones.length * 12) : 0;
  const contentQuality = scoreTextQuality(resumeText);

  const summary = skillGaps.length
    ? `Identified ${skillGaps.length} skill gaps for ${targetRole || 'the target role'}.`
    : `Current profile is reasonably aligned with ${targetRole || 'the target role'}.`;

  const recommendations = buildRecommendations({
    skillGaps,
    resumeScore,
    roadmapReadiness,
    targetRole: targetRole || 'the target role'
  });

  const insight = await Insight.create({
    userId: String(userId || 'anonymous').trim(),
    resumeId: resumeId || null,
    roadmapId: roadmapId || roadmap?._id?.toString() || null,
    targetRole: targetRole || roadmap?.targetRole || 'Software Engineer',
    currentSkills: mergedCurrent,
    targetSkills: normalizedTarget,
    skillGaps,
    summary,
    recommendations,
    metrics: {
      resumeScore,
      roadmapReadiness,
      matchedSkills: mergedCurrent.filter((skill) => normalizedTarget.some((target) => target.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(target.toLowerCase()))).length,
      missingSkills: skillGaps.length,
      contentQuality
    },
    sourceData: {
      resumeName: resume?.originalName || null,
      roadmapTitle
    },
    scope,
    generatedBy: 'analytics-engine'
  });

  return {
    insightId: insight._id,
    userId: insight.userId,
    targetRole: insight.targetRole,
    summary: insight.summary,
    skillGaps: insight.skillGaps,
    recommendations: insight.recommendations,
    metrics: insight.metrics,
    sourceData: insight.sourceData,
    scope: insight.scope,
    generatedBy: insight.generatedBy,
    createdAt: insight.createdAt
  };
};

export const getInsightsForUser = async (userId) => {
  return Insight.find({ userId: String(userId || 'anonymous').trim() }).sort({ createdAt: -1 }).lean();
};

export const getAdminInsights = async () => {
  const [totalInsights, recentInsights, highPriorityGaps] = await Promise.all([
    Insight.countDocuments(),
    Insight.find().sort({ createdAt: -1 }).limit(10).lean(),
    Insight.aggregate([
      { $unwind: '$skillGaps' },
      { $match: { 'skillGaps.priority': 'high' } },
      { $group: { _id: '$skillGaps.skill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  const uniqueUsers = await Insight.distinct('userId');

  return {
    totalInsights,
    totalUsers: uniqueUsers.length,
    recentInsights,
    topHighPrioritySkillGaps: highPriorityGaps,
    generatedAt: new Date().toISOString()
  };
};
