import huggingfaceService from './huggingface.js';

class RoadmapGeneratorService {
  /**
   * Generate a personalized 4-8 week learning roadmap
   */
  async generateRoadmap(skillGapData, resumeData, targetRole, weeks = 6) {
    try {
      const { missingSkills, recommendations, currentSkills } = skillGapData;
      
      // Prioritize skills to learn
      const prioritizedSkills = this.prioritizeSkills(missingSkills, recommendations);
      
      // Generate weekly breakdown
      const weeklyPlan = await this.createWeeklyPlan(
        prioritizedSkills,
        currentSkills,
        targetRole,
        weeks
      );
      
      // Create capstone project
      const capstoneProject = this.generateCapstoneProject(targetRole, prioritizedSkills);
      
      // Calculate total milestones
      const totalMilestones = weeklyPlan.reduce((sum, week) => sum + week.milestones.length, 0);
      
      return {
        targetRole,
        duration: {
          weeks,
          hoursPerWeek: 10
        },
        weeks: weeklyPlan,
        progress: {
          completedMilestones: 0,
          totalMilestones,
          percentComplete: 0,
          currentWeek: 1
        },
        capstoneProject
      };
    } catch (error) {
      console.error('Roadmap generation error:', error);
      throw error;
    }
  }

  /**
   * Prioritize skills based on importance and dependencies
   */
  prioritizeSkills(missingSkills, recommendations) {
    // Sort by priority (importance)
    const sorted = [...recommendations].sort((a, b) => b.priority - a.priority);
    
    // Group by category for better learning flow
    const grouped = {
      foundational: [],
      intermediate: [],
      advanced: []
    };
    
    sorted.forEach(rec => {
      if (rec.priority >= 9) {
        grouped.foundational.push(rec);
      } else if (rec.priority >= 6) {
        grouped.intermediate.push(rec);
      } else {
        grouped.advanced.push(rec);
      }
    });
    
    return [...grouped.foundational, ...grouped.intermediate, ...grouped.advanced];
  }

  /**
   * Create weekly learning plan with 40+ milestones
   */
  async createWeeklyPlan(prioritizedSkills, currentSkills, targetRole, totalWeeks) {
    const weeklyPlan = [];
    const milestonesPerWeek = Math.ceil(40 / totalWeeks); // Distribute 40+ milestones
    
    // Divide skills across weeks
    const skillsPerWeek = Math.ceil(prioritizedSkills.length / totalWeeks);
    
    for (let week = 1; week <= totalWeeks; week++) {
      const startIndex = (week - 1) * skillsPerWeek;
      const endIndex = Math.min(startIndex + skillsPerWeek, prioritizedSkills.length);
      const weekSkills = prioritizedSkills.slice(startIndex, endIndex);
      
      const weekPlan = await this.createWeekPlan(
        week,
        weekSkills,
        targetRole,
        milestonesPerWeek
      );
      
      weeklyPlan.push(weekPlan);
    }
    
    return weeklyPlan;
  }

  /**
   * Create plan for a single week
   */
  async createWeekPlan(weekNumber, skills, targetRole, milestonesPerWeek) {
    const theme = this.getWeekTheme(weekNumber, skills);
    const objectives = this.getWeekObjectives(weekNumber, skills);
    const milestones = [];
    
    // Create milestones for each skill
    for (const skillRec of skills) {
      const skillMilestones = this.createSkillMilestones(skillRec, milestonesPerWeek / skills.length);
      milestones.push(...skillMilestones);
    }
    
    // Add practice and project milestones
    const practiceMilestones = this.createPracticeMilestones(weekNumber, skills);
    milestones.push(...practiceMilestones);
    
    // Add assessment milestone
    const assessment = this.createAssessment(weekNumber, skills);
    
    return {
      weekNumber,
      theme,
      objectives,
      milestones: milestones.slice(0, milestonesPerWeek + 2), // Ensure we have enough milestones
      assessments: [assessment]
    };
  }

  /**
   * Get theme for the week
   */
  getWeekTheme(weekNumber, skills) {
    const themes = {
      1: 'Foundation & Setup',
      2: 'Core Concepts',
      3: 'Practical Application',
      4: 'Advanced Topics',
      5: 'Integration & Best Practices',
      6: 'Project Development',
      7: 'Optimization & Deployment',
      8: 'Final Project & Portfolio'
    };
    
    if (themes[weekNumber]) {
      return themes[weekNumber];
    }
    
    // Generate theme based on skills
    const skillNames = skills.map(s => s.skill).join(' & ');
    return `Mastering ${skillNames}`;
  }

  /**
   * Get objectives for the week
   */
  getWeekObjectives(weekNumber, skills) {
    const objectives = [];
    
    skills.forEach(skillRec => {
      objectives.push(`Understand and practice ${skillRec.skill}`);
      objectives.push(`Complete hands-on exercises for ${skillRec.skill}`);
    });
    
    objectives.push('Build a mini-project applying learned concepts');
    
    return objectives.slice(0, 5); // Limit to 5 objectives
  }

  /**
   * Create milestones for a specific skill
   */
  createSkillMilestones(skillRecommendation, count) {
    const { skill, resources, estimatedTime } = skillRecommendation;
    const milestones = [];
    
    // Learning milestone
    milestones.push({
      title: `Learn ${skill} Fundamentals`,
      description: `Study core concepts and syntax of ${skill}`,
      category: 'skill',
      priority: 'high',
      estimatedHours: 3,
      resources: resources.slice(0, 2).map(res => ({
        title: res,
        type: 'course',
        url: this.getResourceURL(res),
        duration: '2-3 hours'
      })),
      status: 'not-started'
    });
    
    // Practice milestone
    milestones.push({
      title: `Practice ${skill}`,
      description: `Complete coding exercises and challenges`,
      category: 'practice',
      priority: 'high',
      estimatedHours: 4,
      resources: [{
        title: `${skill} Practice Exercises`,
        type: 'practice',
        url: 'https://www.hackerrank.com',
        duration: '3-4 hours'
      }],
      status: 'not-started'
    });
    
    // Reading/Documentation milestone
    milestones.push({
      title: `Read ${skill} Documentation`,
      description: `Review official documentation and best practices`,
      category: 'reading',
      priority: 'medium',
      estimatedHours: 2,
      resources: [{
        title: `Official ${skill} Docs`,
        type: 'documentation',
        url: this.getOfficialDocsURL(skill),
        duration: '1-2 hours'
      }],
      status: 'not-started'
    });
    
    return milestones;
  }

  /**
   * Create practice and project milestones
   */
  createPracticeMilestones(weekNumber, skills) {
    const milestones = [];
    
    // Create a mini-project
    milestones.push({
      title: `Week ${weekNumber} Mini Project`,
      description: `Build a small project using ${skills.map(s => s.skill).join(', ')}`,
      category: 'project',
      priority: 'high',
      estimatedHours: 5,
      resources: [{
        title: 'Project Ideas and Guidelines',
        type: 'article',
        url: 'https://github.com',
        duration: '4-6 hours'
      }],
      status: 'not-started'
    });
    
    return milestones;
  }

  /**
   * Create assessment for the week
   */
  createAssessment(weekNumber, skills) {
    const skillList = skills.map(s => s.skill).join(', ');
    
    return {
      type: 'quiz',
      description: `Self-assessment quiz covering ${skillList}`,
      link: 'https://www.example.com/quiz'
    };
  }

  /**
   * Generate capstone project
   */
  generateCapstoneProject(targetRole, prioritizedSkills) {
    const roleProjects = {
      'Software Engineer': {
        title: 'Full-Stack Web Application',
        description: 'Build a complete web application with authentication, database, and RESTful API',
        estimatedHours: 20
      },
      'Data Scientist': {
        title: 'End-to-End ML Pipeline',
        description: 'Create a machine learning pipeline from data collection to model deployment',
        estimatedHours: 25
      },
      'Product Manager': {
        title: 'Product Launch Plan',
        description: 'Develop a comprehensive product roadmap and go-to-market strategy',
        estimatedHours: 15
      },
      'DevOps Engineer': {
        title: 'CI/CD Pipeline with Kubernetes',
        description: 'Set up automated deployment pipeline with containerization and orchestration',
        estimatedHours: 20
      },
      'Full Stack Developer': {
        title: 'Modern Web App with Microservices',
        description: 'Build a scalable application using modern frameworks and microservices architecture',
        estimatedHours: 25
      }
    };
    
    const project = roleProjects[targetRole] || {
      title: 'Comprehensive Portfolio Project',
      description: 'Create a project showcasing all learned skills',
      estimatedHours: 20
    };
    
    // Extract technologies from skills
    const technologies = prioritizedSkills
      .slice(0, 8)
      .map(s => s.skill);
    
    return {
      ...project,
      technologies,
      milestones: [
        'Project planning and architecture',
        'Core functionality implementation',
        'Testing and debugging',
        'Documentation and deployment',
        'Portfolio presentation'
      ]
    };
  }

  /**
   * Get resource URL (placeholder - would be real URLs in production)
   */
  getResourceURL(resourceName) {
    if (resourceName.includes('MDN')) return 'https://developer.mozilla.org';
    if (resourceName.includes('freeCodeCamp')) return 'https://www.freecodecamp.org';
    if (resourceName.includes('Official')) return 'https://docs.example.com';
    if (resourceName.includes('YouTube')) return 'https://www.youtube.com';
    if (resourceName.includes('Udemy')) return 'https://www.udemy.com';
    if (resourceName.includes('Coursera')) return 'https://www.coursera.org';
    
    return 'https://www.example.com';
  }

  /**
   * Get official documentation URL
   */
  getOfficialDocsURL(skill) {
    const docsMap = {
      'JavaScript': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      'Python': 'https://docs.python.org/',
      'React': 'https://react.dev/',
      'Node.js': 'https://nodejs.org/docs/',
      'Docker': 'https://docs.docker.com/',
      'Kubernetes': 'https://kubernetes.io/docs/',
      'MongoDB': 'https://docs.mongodb.com/',
      'PostgreSQL': 'https://www.postgresql.org/docs/'
    };
    
    return docsMap[skill] || `https://www.google.com/search?q=${skill}+documentation`;
  }

  /**
   * Update roadmap progress
   */
  updateProgress(roadmap, completedMilestoneId) {
    roadmap.progress.completedMilestones += 1;
    
    if (roadmap.progress.totalMilestones > 0) {
      roadmap.progress.percentComplete = Math.round(
        (roadmap.progress.completedMilestones / roadmap.progress.totalMilestones) * 100
      );
    }
    
    return roadmap;
  }
}

export default new RoadmapGeneratorService();
