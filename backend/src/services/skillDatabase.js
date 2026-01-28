// Comprehensive skill database for 5 major job roles
export const skillDatabase = {
  'Software Engineer': {
    required: {
      languages: ['JavaScript', 'Python', 'Java', 'TypeScript'],
      frameworks: ['React', 'Node.js', 'Express', 'Spring Boot'],
      tools: ['Git', 'Docker', 'Linux', 'VS Code'],
      databases: ['SQL', 'MongoDB', 'PostgreSQL'],
      concepts: ['Data Structures', 'Algorithms', 'OOP', 'REST APIs', 'Testing']
    },
    preferred: {
      languages: ['Go', 'Rust', 'C++'],
      frameworks: ['Next.js', 'GraphQL', 'FastAPI'],
      tools: ['Kubernetes', 'CI/CD', 'AWS', 'Jenkins'],
      databases: ['Redis', 'Elasticsearch'],
      concepts: ['Microservices', 'System Design', 'Security', 'Performance Optimization']
    }
  },

  'Data Scientist': {
    required: {
      languages: ['Python', 'R', 'SQL'],
      frameworks: ['Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch'],
      tools: ['Jupyter', 'Git', 'Tableau', 'Power BI'],
      databases: ['SQL', 'MongoDB'],
      concepts: ['Statistics', 'Machine Learning', 'Data Visualization', 'Feature Engineering', 'Model Evaluation']
    },
    preferred: {
      languages: ['Scala', 'Julia'],
      frameworks: ['Keras', 'XGBoost', 'LightGBM', 'Spark'],
      tools: ['AWS SageMaker', 'Azure ML', 'Databricks', 'MLflow'],
      databases: ['BigQuery', 'Snowflake'],
      concepts: ['Deep Learning', 'NLP', 'Computer Vision', 'Time Series', 'A/B Testing']
    }
  },

  'Product Manager': {
    required: {
      languages: ['SQL'],
      frameworks: [],
      tools: ['Jira', 'Confluence', 'Figma', 'Analytics Tools', 'Roadmap Tools'],
      databases: [],
      concepts: ['Product Strategy', 'User Research', 'Agile/Scrum', 'Stakeholder Management', 'Data Analysis', 'Prioritization']
    },
    preferred: {
      languages: ['Python'],
      frameworks: [],
      tools: ['Mixpanel', 'Amplitude', 'Productboard', 'Miro', 'Notion'],
      databases: [],
      concepts: ['Go-to-Market', 'Pricing Strategy', 'Growth Hacking', 'Design Thinking', 'OKRs', 'Technical Architecture']
    }
  },

  'DevOps Engineer': {
    required: {
      languages: ['Python', 'Bash', 'YAML'],
      frameworks: [],
      tools: ['Docker', 'Kubernetes', 'Jenkins', 'Git', 'Linux', 'AWS', 'Terraform'],
      databases: ['SQL'],
      concepts: ['CI/CD', 'Infrastructure as Code', 'Monitoring', 'Automation', 'Networking', 'Security']
    },
    preferred: {
      languages: ['Go', 'Ruby'],
      frameworks: [],
      tools: ['Ansible', 'Prometheus', 'Grafana', 'ELK Stack', 'Helm', 'ArgoCD'],
      databases: ['Redis', 'MongoDB'],
      concepts: ['GitOps', 'Service Mesh', 'Cloud Architecture', 'Disaster Recovery', 'Cost Optimization']
    }
  },

  'Full Stack Developer': {
    required: {
      languages: ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
      frameworks: ['React', 'Node.js', 'Express', 'Vue', 'Angular'],
      tools: ['Git', 'npm', 'Webpack', 'VS Code'],
      databases: ['MongoDB', 'PostgreSQL', 'MySQL'],
      concepts: ['REST APIs', 'Authentication', 'State Management', 'Responsive Design', 'Testing']
    },
    preferred: {
      languages: ['Python', 'Java'],
      frameworks: ['Next.js', 'NestJS', 'GraphQL', 'Redux', 'Tailwind CSS'],
      tools: ['Docker', 'AWS', 'Vercel', 'Firebase'],
      databases: ['Redis', 'Firebase', 'DynamoDB'],
      concepts: ['Microservices', 'WebSockets', 'Performance Optimization', 'SEO', 'Accessibility']
    }
  }
};

// Skill importance weights
export const skillWeights = {
  critical: 1.0,
  important: 0.7,
  'nice-to-have': 0.4
};

// Category weights for overall scoring
export const categoryWeights = {
  languages: 0.25,
  frameworks: 0.25,
  tools: 0.20,
  databases: 0.15,
  concepts: 0.15
};

/**
 * Get all skills for a specific role
 */
export function getAllSkillsForRole(role) {
  const roleSkills = skillDatabase[role];
  if (!roleSkills) return [];

  const allSkills = new Set();

  // Add required skills
  Object.values(roleSkills.required).forEach(skillArray => {
    skillArray.forEach(skill => allSkills.add(skill));
  });

  // Add preferred skills
  Object.values(roleSkills.preferred).forEach(skillArray => {
    skillArray.forEach(skill => allSkills.add(skill));
  });

  return Array.from(allSkills);
}

/**
 * Get required skills for a role
 */
export function getRequiredSkills(role) {
  const roleSkills = skillDatabase[role];
  if (!roleSkills) return [];

  const required = new Set();
  Object.values(roleSkills.required).forEach(skillArray => {
    skillArray.forEach(skill => required.add(skill));
  });

  return Array.from(required);
}

/**
 * Categorize a skill
 */
export function categorizeSkill(skill) {
  for (const [role, categories] of Object.entries(skillDatabase)) {
    for (const [category, skillLists] of Object.entries(categories)) {
      for (const [type, skills] of Object.entries(skillLists)) {
        if (skills.includes(skill)) {
          return { role, importance: category, type };
        }
      }
    }
  }
  return { role: null, importance: 'nice-to-have', type: 'technical' };
}

/**
 * Get skill importance for a specific role
 */
export function getSkillImportance(skill, role) {
  const roleSkills = skillDatabase[role];
  if (!roleSkills) return 'nice-to-have';

  // Check if skill is in required
  for (const skills of Object.values(roleSkills.required)) {
    if (skills.includes(skill)) return 'critical';
  }

  // Check if skill is in preferred
  for (const skills of Object.values(roleSkills.preferred)) {
    if (skills.includes(skill)) return 'important';
  }

  return 'nice-to-have';
}

/**
 * Normalize skill names for matching
 */
export function normalizeSkill(skill) {
  const normalizations = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'py': 'Python',
    'react.js': 'React',
    'vue.js': 'Vue',
    'node': 'Node.js',
    'postgres': 'PostgreSQL',
    'mongo': 'MongoDB',
    'k8s': 'Kubernetes'
  };

  const lower = skill.toLowerCase().trim();
  return normalizations[lower] || skill;
}
