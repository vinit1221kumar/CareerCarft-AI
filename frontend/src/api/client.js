const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const errorMessage = payload?.error?.message || payload?.error || payload?.message || 'Request failed';
    throw new Error(errorMessage);
  }

  return payload;
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch(`${API_BASE_URL}/resume/upload`, {
    method: 'POST',
    body: formData
  });

  return parseResponse(response);
};

export const getResumeById = async (resumeId) => {
  const response = await fetch(`${API_BASE_URL}/resume/resume/${resumeId}`, {
    method: 'GET'
  });

  return parseResponse(response);
};

export const analyzeResume = async ({ resumeText, candidateName, jobTitle, targetSkills }) => {
  const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      resume_text: resumeText,
      candidate_name: candidateName || undefined,
      job_title: jobTitle || undefined,
      target_skills: targetSkills || []
    })
  });

  return parseResponse(response);
};

export const generateRoadmap = async ({ userId, targetRole, durationWeeks, currentSkills, targetSkills, resumeId }) => {
  const response = await fetch(`${API_BASE_URL}/roadmap/generate-roadmap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      targetRole,
      durationWeeks,
      currentSkills,
      targetSkills,
      resumeId
    })
  });

  return parseResponse(response);
};

export const getInsights = async ({ userId, resumeId, targetRole }) => {
  const query = new URLSearchParams({
    userId,
    resumeId,
    targetRole
  });

  const response = await fetch(`${API_BASE_URL}/analytics/insights?${query.toString()}`, {
    method: 'GET'
  });

  return parseResponse(response);
};
