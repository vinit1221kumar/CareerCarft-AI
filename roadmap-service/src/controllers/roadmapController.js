import { buildFallbackRoadmap, buildRoadmapPrompt, getLatestRoadmapForUser, getRoadmapById, saveRoadmap } from '../services/roadmapService.js';
import { postWithRetry } from '../services/httpClient.js';
import { getWithRetry } from '../services/httpClient.js';

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};

const validatePayload = (body) => {
  if (!body.userId) return 'userId is required';
  if (!body.targetRole) return 'targetRole is required';
  return null;
};

const tryParseJson = (value) => {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const fetchResumeById = async (resumeId) => {
  if (!resumeId || !process.env.RESUME_SERVICE_URL) return null;
  try {
    const response = await getWithRetry(`${process.env.RESUME_SERVICE_URL}/resume/${resumeId}`, {
      timeout: Number.parseInt(process.env.SERVICE_TIMEOUT_MS || '10000', 10)
    });
    return response?.data || null;
  } catch (error) {
    console.warn('Resume enrichment failed:', error.message);
    return null;
  }
};

const analyzeResumeWithAI = async ({ resumeText, candidateName, targetSkills, jobTitle }) => {
  if (!resumeText || !process.env.AI_SERVICE_URL) return null;

  try {
    const response = await postWithRetry(
      `${process.env.AI_SERVICE_URL}/analyze`,
      {
        resume_text: resumeText,
        candidate_name: candidateName || null,
        job_title: jobTitle || null,
        target_skills: targetSkills || []
      },
      {
        timeout: Number.parseInt(process.env.SERVICE_TIMEOUT_MS || '10000', 10),
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`AI service returned ${response.status}`);
    }

    return response.data?.data || null;
  } catch (error) {
    console.warn('AI enrichment failed:', error.message);
    return null;
  }
};

const callLLM = async ({ prompt }) => {
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || 'gpt-3.5-turbo';

  if (!apiUrl || !apiKey) {
    return { generatedBy: 'fallback-roadmap-engine', roadmap: null };
  }

  const response = await postWithRetry(apiUrl, {
    model,
    messages: [
      { role: 'system', content: 'You generate structured career roadmaps in JSON only.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.4
  }, {
    timeout: Number.parseInt(process.env.LLM_TIMEOUT_MS || '15000', 10),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    }
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`LLM API returned ${response.status}`);
  }

  const data = response.data;
  const content = data?.choices?.[0]?.message?.content || data?.output || '';
  const parsed = tryParseJson(content);

  return {
    generatedBy: `llm:${model}`,
    roadmap: parsed,
    raw: content
  };
};

export const generateRoadmap = async (req, res, next) => {
  try {
    const validationError = validatePayload(req.body || {});
    if (validationError) {
      return res.status(400).json({
        error: validationError,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const payload = {
      userId: String(req.body.userId).trim(),
      targetRole: String(req.body.targetRole).trim(),
      experienceLevel: req.body.experienceLevel || 'beginner',
      durationWeeks: Math.min(Math.max(parseInt(req.body.durationWeeks || '6', 10), 4), 8),
      currentSkills: normalizeArray(req.body.currentSkills),
      targetSkills: normalizeArray(req.body.targetSkills),
      focusAreas: normalizeArray(req.body.focusAreas),
      resumeId: req.body.resumeId ? String(req.body.resumeId).trim() : null,
      resumeText: req.body.resumeText ? String(req.body.resumeText).trim() : null,
      candidateName: req.body.candidateName ? String(req.body.candidateName).trim() : null
    };

    const resumeRecord = await fetchResumeById(payload.resumeId);
    const resumeText = payload.resumeText || resumeRecord?.data?.rawText || resumeRecord?.rawText || '';
    const aiAnalysis = await analyzeResumeWithAI({
      resumeText,
      candidateName: payload.candidateName,
      targetSkills: payload.targetSkills,
      jobTitle: payload.targetRole
    });

    const aiCurrentSkills = aiAnalysis?.skills || [];
    const aiTargetSkills = aiAnalysis?.target_skills || aiAnalysis?.targetSkills || [];

    payload.currentSkills = normalizeArray([...payload.currentSkills, ...aiCurrentSkills]);
    payload.targetSkills = normalizeArray([...payload.targetSkills, ...aiTargetSkills]);
    payload.focusAreas = normalizeArray([
      ...payload.focusAreas,
      ...(aiAnalysis?.improvement_suggestions || []).slice(0, 3)
    ]);

    const prompt = buildRoadmapPrompt(payload);

    let roadmapPayload;
    let generatedBy = 'fallback-roadmap-engine';

    try {
      const llmResult = await callLLM({ prompt });
      generatedBy = llmResult.generatedBy;
      roadmapPayload = llmResult.roadmap || buildFallbackRoadmap(payload);
    } catch (llmError) {
      roadmapPayload = buildFallbackRoadmap(payload);
      generatedBy = 'fallback-roadmap-engine';
      console.warn('LLM generation failed, using fallback roadmap:', llmError.message);
    }

    if (!roadmapPayload || !Array.isArray(roadmapPayload.milestones)) {
      roadmapPayload = buildFallbackRoadmap(payload);
    }

    const savedRoadmap = await saveRoadmap({
      ...payload,
      prompt,
      roadmapPayload,
      generatedBy
    });

    return res.status(201).json({
      message: 'Roadmap generated successfully',
      data: {
        roadmapId: savedRoadmap._id,
        ...roadmapPayload,
        userId: payload.userId,
        targetRole: payload.targetRole,
        experienceLevel: payload.experienceLevel,
        durationWeeks: payload.durationWeeks,
        generatedBy,
        sourceData: {
          resumeId: payload.resumeId,
          aiAnalyzed: Boolean(aiAnalysis)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
};

export const getRoadmap = async (req, res, next) => {
  try {
    const roadmap = await getRoadmapById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({
        error: 'Roadmap not found',
        code: 'ROADMAP_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      message: 'Roadmap retrieved successfully',
      data: roadmap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
};

export const getLatestRoadmap = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const roadmap = await getLatestRoadmapForUser(userId);

    if (!roadmap) {
      return res.status(404).json({
        error: 'Roadmap not found for user',
        code: 'ROADMAP_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      message: 'Latest roadmap retrieved successfully',
      data: roadmap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return next(error);
  }
};

export const health = (req, res) => {
  res.status(200).json({
    service: 'Roadmap Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

export const status = (req, res) => {
  res.status(200).json({
    service: 'Roadmap Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
