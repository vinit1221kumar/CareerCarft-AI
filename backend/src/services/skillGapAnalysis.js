import huggingfaceService from './huggingface.js';
import { 
  skillDatabase, 
  getAllSkillsForRole, 
  getRequiredSkills,
  getSkillImportance,
  normalizeSkill,
  categoryWeights 
} from './skillDatabase.js';

class SkillGapService {
  /**
   * Perform comprehensive skill gap analysis
   */
  async analyzeSkillGap(resumeData, targetRole) {
    try {
      // Extract current skills from resume
      const currentSkills = this.extractCurrentSkills(resumeData);
      
      // Get required skills for target role
      const requiredSkills = getAllSkillsForRole(targetRole);
      
      // Generate embeddings for skill matching
      const skillEmbeddings = await this.generateSkillEmbeddings(currentSkills, requiredSkills);
      
      // Find matching and missing skills
      const { matchingSkills, missingSkills } = await this.compareSkills(
        currentSkills, 
        requiredSkills,
        skillEmbeddings,
        targetRole
      );
      
      // Calculate skill coverage metrics
      const skillCoverage = this.calculateSkillCoverage(currentSkills, requiredSkills, targetRole);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(missingSkills, targetRole);
      
      // Calculate overall match percentage
      const overallMatch = this.calculateOverallMatch(matchingSkills, requiredSkills, missingSkills);
      
      return {
        currentSkills,
        requiredSkills,
        matchingSkills,
        missingSkills,
        skillCoverage,
        overallMatch,
        recommendations,
        skillEmbeddings
      };
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      throw error;
    }
  }

  /**
   * Extract all skills from resume data
   */
  extractCurrentSkills(resumeData) {
    const skills = new Set();
    
    if (resumeData.skills) {
      // Add all categorized skills
      Object.values(resumeData.skills).forEach(skillArray => {
        if (Array.isArray(skillArray)) {
          skillArray.forEach(skill => {
            const normalized = normalizeSkill(skill);
            skills.add(normalized);
          });
        }
      });
    }
    
    // Extract skills from experience and projects
    if (resumeData.experience) {
      resumeData.experience.forEach(exp => {
        // Extract from responsibilities and achievements
        const text = JSON.stringify(exp).toLowerCase();
        this.extractSkillsFromText(text, skills);
      });
    }
    
    if (resumeData.projects) {
      resumeData.projects.forEach(project => {
        if (project.technologies) {
          project.technologies.forEach(tech => skills.add(normalizeSkill(tech)));
        }
      });
    }
    
    return Array.from(skills);
  }

  /**
   * Extract skills from free text using pattern matching
   */
  extractSkillsFromText(text, skillSet) {
    const allPossibleSkills = [];
    Object.values(skillDatabase).forEach(roleSkills => {
      Object.values(roleSkills.required).forEach(skills => allPossibleSkills.push(...skills));
      Object.values(roleSkills.preferred).forEach(skills => allPossibleSkills.push(...skills));
    });
    
    allPossibleSkills.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        skillSet.add(skill);
      }
    });
  }

  /**
   * Generate embeddings for semantic skill matching
   */
  async generateSkillEmbeddings(currentSkills, requiredSkills) {
    try {
      const allSkills = [...new Set([...currentSkills, ...requiredSkills])];
      const embeddings = new Map();

      // If HuggingFace is disabled, fall back to text-based matching
      if (!huggingfaceService.isEnabled) {
        console.log('Using simple text-based skill matching (HuggingFace not available)');
        return embeddings;
      }

      // Generate embeddings in batches to avoid API limits
      const batchSize = 10;
      for (let i = 0; i < allSkills.length; i += batchSize) {
        const batch = allSkills.slice(i, i + batchSize);
        const batchEmbeddings = await huggingfaceService.generateBatchEmbeddings(batch);
        
        batch.forEach((skill, index) => {
          embeddings.set(skill, batchEmbeddings[index]);
        });
      }
      
      return embeddings;
    } catch (error) {
      console.warn('Embedding generation failed, using text-based matching:', error.message);
      return new Map();
    }
  }

  /**
   * Compare current skills with required skills using embeddings
   */
  async compareSkills(currentSkills, requiredSkills, embeddings, targetRole) {
    const matchingSkills = [];
    const missingSkills = [];
    const similarityThreshold = 0.75;
    const useEmbeddings = embeddings.size > 0 && huggingfaceService.isEnabled;
    
    for (const requiredSkill of requiredSkills) {
      let bestMatch = null;
      let bestSimilarity = 0;
      
      // Check for exact matches first
      if (currentSkills.some(s => s.toLowerCase() === requiredSkill.toLowerCase())) {
        matchingSkills.push(requiredSkill);
        continue;
      }
      
      // Check for semantic similarity using embeddings
      let matched = false;

      if (useEmbeddings && embeddings.has(requiredSkill)) {
        const requiredEmbedding = embeddings.get(requiredSkill);
        
        for (const currentSkill of currentSkills) {
          if (embeddings.has(currentSkill)) {
            const currentEmbedding = embeddings.get(currentSkill);
            const similarity = huggingfaceService.cosineSimilarity(
              requiredEmbedding, 
              currentEmbedding
            );
            
            if (similarity > bestSimilarity) {
              bestSimilarity = similarity;
              bestMatch = currentSkill;
            }
          }
        }

        // If similarity is high enough, consider it a match
        if (bestSimilarity >= similarityThreshold) {
          matchingSkills.push(requiredSkill);
          matched = true;
        }
      } else {
        // Fallback: fuzzy text matching
        for (const currentSkill of currentSkills) {
          if (this.fuzzyMatch(requiredSkill, currentSkill)) {
            matchingSkills.push(requiredSkill);
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        // Determine importance and category
        const importance = getSkillImportance(requiredSkill, targetRole);
        const category = this.determineSkillCategory(requiredSkill, targetRole);
        
        missingSkills.push({
          skill: requiredSkill,
          importance,
          category
        });
      }
    }
    
    return { matchingSkills, missingSkills };
  }

  /**
   * Simple fuzzy text matching for skills
   */
  fuzzyMatch(skill1, skill2) {
    const s1 = skill1.toLowerCase().replace(/[.\-_\s]/g, '');
    const s2 = skill2.toLowerCase().replace(/[.\-_\s]/g, '');

    // Exact match after normalization
    if (s1 === s2) return true;

    // Contains match (handles React vs React.js)
    if (s1.includes(s2) || s2.includes(s1)) return true;

    // Levenshtein distance for minor typos/variants
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length) || 1;
    return distance / maxLength < 0.3; // 70% similarity threshold
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Determine skill category
   */
  determineSkillCategory(skill, targetRole) {
    const roleSkills = skillDatabase[targetRole];
    if (!roleSkills) return 'technical';
    
    // Check in required and preferred categories
    for (const importance of ['required', 'preferred']) {
      const categories = roleSkills[importance];
      for (const [category, skills] of Object.entries(categories)) {
        if (skills.includes(skill)) {
          // Map database categories to schema categories
          const categoryMap = {
            'languages': 'language',
            'frameworks': 'framework',
            'tools': 'tool',
            'databases': 'technical',
            'concepts': 'technical'
          };
          return categoryMap[category] || 'technical';
        }
      }
    }
    
    return 'technical';
  }

  /**
   * Calculate skill coverage across categories
   */
  calculateSkillCoverage(currentSkills, requiredSkills, targetRole) {
    const roleSkills = skillDatabase[targetRole];
    if (!roleSkills) return {};
    
    const coverage = {
      technical: 0,
      soft: 0,
      tools: 0,
      frameworks: 0,
      languages: 0
    };
    
    // Calculate coverage for each category
    const categories = ['languages', 'frameworks', 'tools'];
    
    categories.forEach(category => {
      const requiredInCategory = [
        ...(roleSkills.required[category] || []),
        ...(roleSkills.preferred[category] || [])
      ];
      
      if (requiredInCategory.length > 0) {
        const matches = requiredInCategory.filter(skill => 
          currentSkills.some(current => 
            current.toLowerCase() === skill.toLowerCase()
          )
        ).length;
        
        coverage[category] = Math.round((matches / requiredInCategory.length) * 100);
      }
    });
    
    // Calculate technical (databases + concepts)
    const technicalSkills = [
      ...(roleSkills.required.databases || []),
      ...(roleSkills.preferred.databases || []),
      ...(roleSkills.required.concepts || []),
      ...(roleSkills.preferred.concepts || [])
    ];
    
    if (technicalSkills.length > 0) {
      const matches = technicalSkills.filter(skill => 
        currentSkills.some(current => 
          current.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(current.toLowerCase())
        )
      ).length;
      
      coverage.technical = Math.round((matches / technicalSkills.length) * 100);
    }
    
    return coverage;
  }

  /**
   * Calculate overall skill match percentage
   */
  calculateOverallMatch(matchingSkills, requiredSkills, missingSkills) {
    if (requiredSkills.length === 0) return 0;
    
    // Weight critical skills more heavily
    let totalWeight = 0;
    let matchedWeight = 0;
    
    requiredSkills.forEach(skill => {
      const weight = 1; // Base weight
      totalWeight += weight;
      
      if (matchingSkills.includes(skill)) {
        matchedWeight += weight;
      }
    });
    
    return Math.round((matchedWeight / totalWeight) * 100);
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(missingSkills, targetRole) {
    const recommendations = [];
    
    // Sort missing skills by importance
    const sortedSkills = missingSkills.sort((a, b) => {
      const importanceOrder = { critical: 0, important: 1, 'nice-to-have': 2 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    });
    
    // Generate recommendations for top missing skills
    const topMissing = sortedSkills.slice(0, 10);
    
    for (const { skill, importance, category } of topMissing) {
      const resources = this.getSkillResources(skill);
      const estimatedTime = this.estimateLearningTime(skill, category);
      const priority = this.calculatePriority(importance);
      
      recommendations.push({
        skill,
        reason: `Required ${importance} skill for ${targetRole}`,
        resources,
        estimatedTime,
        priority
      });
    }
    
    return recommendations;
  }

  /**
   * Get learning resources for a skill
   */
  getSkillResources(skill) {
    const resourceMap = {
      'JavaScript': [
        'MDN Web Docs - JavaScript Guide',
        'JavaScript.info - Modern JavaScript Tutorial',
        'freeCodeCamp - JavaScript Algorithms and Data Structures'
      ],
      'Python': [
        'Python.org - Official Tutorial',
        'Real Python - Python Tutorials',
        'Automate the Boring Stuff with Python'
      ],
      'React': [
        'React Official Documentation',
        'freeCodeCamp - React Course',
        'Scrimba - Learn React for Free'
      ],
      'Docker': [
        'Docker Official Documentation',
        'Docker for Beginners - YouTube',
        'Docker Deep Dive - Book by Nigel Poulton'
      ]
    };
    
    return resourceMap[skill] || [
      `Official ${skill} documentation`,
      `${skill} courses on Udemy/Coursera`,
      `${skill} tutorials on YouTube`
    ];
  }

  /**
   * Estimate learning time for a skill
   */
  estimateLearningTime(skill, category) {
    const timeEstimates = {
      'language': '4-8 weeks',
      'framework': '3-6 weeks',
      'tool': '1-3 weeks',
      'technical': '2-4 weeks'
    };
    
    return timeEstimates[category] || '2-4 weeks';
  }

  /**
   * Calculate priority score
   */
  calculatePriority(importance) {
    const priorityMap = {
      'critical': 10,
      'important': 7,
      'nice-to-have': 4
    };
    
    return priorityMap[importance] || 5;
  }
}

export default new SkillGapService();
