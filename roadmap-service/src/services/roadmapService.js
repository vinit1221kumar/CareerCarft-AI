import Roadmap from '../models/Roadmap.js';

const DEFAULT_DURATION = 6;

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const clampWeeks = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return DEFAULT_DURATION;
  return Math.min(Math.max(parsed, 4), 8);
};

export const buildRoadmapPrompt = (input) => {
  const weeks = clampWeeks(input.durationWeeks);
  const targetRole = input.targetRole || 'Software Engineer';
  const currentSkills = normalizeList(input.currentSkills).join(', ') || 'Not provided';
  const targetSkills = normalizeList(input.targetSkills).join(', ') || 'Not provided';
  const focusAreas = normalizeList(input.focusAreas).join(', ') || 'Role-relevant fundamentals';
  const experienceLevel = input.experienceLevel || 'beginner';

  return `
You are an expert career coach and technical roadmap designer.
Create a detailed ${weeks}-week career roadmap for the following profile.

Output strictly valid JSON with this shape:
{
  "roadmapTitle": string,
  "roadmapSummary": string,
  "generatedBy": string,
  "durationWeeks": number,
  "milestones": [
    {
      "week": number,
      "title": string,
      "objectives": string[],
      "resources": string[],
      "deliverables": string[],
      "estimatedHours": number
    }
  ],
  "recommendations": string[]
}

Context:
- Target role: ${targetRole}
- Experience level: ${experienceLevel}
- Current skills: ${currentSkills}
- Target skills: ${targetSkills}
- Focus areas: ${focusAreas}
- Duration in weeks: ${weeks}

Requirements:
- Create exactly ${weeks} milestones, one per week.
- Make objectives specific, measurable, and practical.
- Include at least 2 resources per week.
- Include at least 1 deliverable per week.
- Keep the plan realistic for a ${experienceLevel} learner.
- Prefer modern tooling and market-relevant skills.
`.trim();
};

const fallbackMilestoneResources = (role, focus, week) => [
  `${role} fundamentals documentation`,
  `${focus} hands-on tutorial for week ${week}`
];

const fallbackDeliverables = (week) => [
  `Complete week ${week} exercises`,
  `Publish a short reflection or notes`
];

export const buildFallbackRoadmap = (input) => {
  const weeks = clampWeeks(input.durationWeeks);
  const targetRole = input.targetRole || 'Software Engineer';
  const currentSkills = normalizeList(input.currentSkills);
  const targetSkills = normalizeList(input.targetSkills);
  const focusAreas = normalizeList(input.focusAreas);
  const dominantFocus = focusAreas[0] || 'career growth';

  const milestoneTemplates = [
    'Foundations and gap analysis',
    'Core skill building',
    'Applied practice',
    'Project implementation',
    'Interview preparation',
    'Portfolio polishing',
    'Advanced specialization',
    'Final review and launch'
  ];

  const milestones = Array.from({ length: weeks }, (_, index) => {
    const week = index + 1;
    const title = milestoneTemplates[index] || `Week ${week} execution`;
    const objectives = [
      `Strengthen ${dominantFocus} for the ${targetRole} path`,
      `Close the most important skill gap for week ${week}`,
      targetSkills[index % Math.max(targetSkills.length, 1)]
        ? `Practice ${targetSkills[index % Math.max(targetSkills.length, 1)]}`
        : `Build confidence with role-specific concepts`
    ];

    if (currentSkills.length) {
      objectives.push(`Connect existing strength in ${currentSkills[index % currentSkills.length]} to the roadmap`);
    }

    return {
      week,
      title,
      objectives,
      resources: fallbackMilestoneResources(targetRole, dominantFocus, week),
      deliverables: fallbackDeliverables(week),
      estimatedHours: week <= 2 ? 8 : 10
    };
  });

  return {
    roadmapTitle: `${weeks}-Week ${targetRole} Roadmap`,
    roadmapSummary: `A practical ${weeks}-week roadmap focused on ${targetRole.toLowerCase()} readiness, aligned to ${dominantFocus}.`,
    generatedBy: 'fallback-roadmap-engine',
    durationWeeks: weeks,
    milestones,
    recommendations: [
      `Dedicate a minimum of 8-10 focused hours each week`,
      `Track progress in a single portfolio repository`,
      `Review weak areas every weekend and adjust the next week's plan`,
      `Prepare at least one interview story per week` 
    ]
  };
};

export const saveRoadmap = async ({
  userId,
  targetRole,
  experienceLevel,
  durationWeeks,
  currentSkills,
  targetSkills,
  focusAreas,
  prompt,
  roadmapPayload,
  generatedBy,
  sourceData
}) => {
  return Roadmap.create({
    userId,
    targetRole,
    experienceLevel,
    durationWeeks,
    currentSkills,
    targetSkills,
    focusAreas,
    prompt,
    generatedBy,
    sourceData: sourceData || {
      resumeId: null,
      aiAnalyzed: false
    },
    roadmapTitle: roadmapPayload.roadmapTitle,
    roadmapSummary: roadmapPayload.roadmapSummary,
    milestones: roadmapPayload.milestones,
    recommendations: roadmapPayload.recommendations,
    status: 'saved'
  });
};

export const getRoadmapById = async (id) => Roadmap.findById(id).lean();

export const getLatestRoadmapForUser = async (userId) => Roadmap.findOne({ userId }).sort({ createdAt: -1 }).lean();
