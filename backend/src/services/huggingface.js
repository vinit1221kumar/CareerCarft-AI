// Try to import HuggingFace, but make it optional
let HfInference;
let isHuggingFaceAvailable = false;

try {
  const module = await import('@huggingface/inference');
  HfInference = module.HfInference;
  isHuggingFaceAvailable = true;
} catch (error) {
  console.warn('⚠️  HuggingFace not available. Using fallback methods only.');
}

class HuggingFaceService {
  constructor() {
    this.isEnabled = false;
    this.hf = null;
    this.embeddingModel = 'sentence-transformers/all-MiniLM-L6-v2';
    this.llmModel = 'mistralai/Mistral-7B-Instruct-v0.2';
    
    // Only initialize if HuggingFace is available and API key is provided
    if (isHuggingFaceAvailable && process.env.HUGGINGFACE_API_KEY) {
      try {
        this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
        this.isEnabled = true;
        console.log('✅ HuggingFace API initialized');
      } catch (error) {
        console.warn('⚠️  HuggingFace initialization failed:', error.message);
      }
    } else {
      if (!isHuggingFaceAvailable) {
        console.warn('⚠️  HuggingFace library not installed. Install with: npm install @huggingface/inference');
      }
      if (!process.env.HUGGINGFACE_API_KEY) {
        console.warn('⚠️  HUGGINGFACE_API_KEY not configured. Using fallback methods.');
      }
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text) {
    // Use HuggingFace if available, otherwise use simple hash-based fallback
    if (this.isEnabled && this.hf) {
      try {
        const response = await this.hf.featureExtraction({
          model: this.embeddingModel,
          inputs: text
        });
        return response;
      } catch (error) {
        console.warn('HuggingFace embedding failed, using fallback:', error.message);
        return this.fallbackEmbedding(text);
      }
    }
    return this.fallbackEmbedding(text);
  }
  
  /**
   * Simple fallback embedding using character-based hashing
   */
  fallbackEmbedding(text) {
    const normalized = text.toLowerCase().trim();
    const vector = new Array(384).fill(0); // Match common embedding size
    
    // Generate pseudo-embedding based on character distribution
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      const index = (charCode * i) % vector.length;
      vector[index] += 1 / (normalized.length + 1);
    }
    
    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateBatchEmbeddings(texts) {
    try {
      const embeddings = await Promise.all(
        texts.map(text => this.generateEmbedding(text))
      );
      return embeddings;
    } catch (error) {
      console.error('Batch embedding error:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    const denom = magnitudeA * magnitudeB;
    if (!denom || Number.isNaN(denom)) return 0; // Avoid NaN when vectors are zero
    return dotProduct / denom;
  }

  /**
   * Score resume across 10+ criteria using LLM
   */
  async scoreResume(resumeData, targetRole = 'Software Engineer') {
    // Always use fallback scoring if HuggingFace is not enabled
    if (!this.isEnabled || !this.hf) {
      console.log('Using rule-based scoring (HuggingFace not available)');
      return this.fallbackScoring(resumeData);
    }
    
    try {
      const prompt = `You are an expert resume reviewer. Analyze the following resume for a ${targetRole} position and provide a detailed scoring across these 10 criteria (score each from 0-10):

1. Content Quality: Clarity, grammar, and professional writing
2. Skill Relevance: How well skills match the ${targetRole} role
3. Experience Level: Depth and relevance of work experience
4. Education Alignment: Educational background fit
5. Formatting: Resume structure and readability
6. Keyword Match: Industry-relevant keywords and terms
7. Project Complexity: Quality and complexity of projects
8. Industry Fit: Alignment with industry standards
9. Career Progression: Growth trajectory and advancement
10. Certifications: Relevant certifications and continuous learning

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Provide your response in the following JSON format:
{
  "scores": {
    "contentQuality": <0-10>,
    "skillRelevance": <0-10>,
    "experienceLevel": <0-10>,
    "educationAlignment": <0-10>,
    "formatting": <0-10>,
    "keywordMatch": <0-10>,
    "projectComplexity": <0-10>,
    "industryFit": <0-10>,
    "careerProgression": <0-10>,
    "certifications": <0-10>
  },
  "overallScore": <0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

      const response = await this.hf.textGeneration({
        model: this.llmModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          return_full_text: false
        }
      });

      // Parse the LLM response
      const result = this.parseScoreResponse(response.generated_text);
      return result;
    } catch (error) {
      console.warn('Resume scoring with HuggingFace failed, using fallback:', error.message);
      // Fallback to rule-based scoring if LLM fails
      return this.fallbackScoring(resumeData);
    }
  }

  /**
   * Parse LLM response and extract structured scoring data
   */
  parseScoreResponse(text) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing LLM response:', error);
    }
    
    // Return default structure if parsing fails
    return this.getDefaultScoreStructure();
  }

  /**
   * Fallback rule-based scoring when LLM is unavailable
   */
  fallbackScoring(resumeData) {
    const scores = {
      contentQuality: this.scoreContentQuality(resumeData),
      skillRelevance: this.scoreSkillRelevance(resumeData),
      experienceLevel: this.scoreExperience(resumeData),
      educationAlignment: this.scoreEducation(resumeData),
      formatting: 7, // Default value
      keywordMatch: this.scoreKeywords(resumeData),
      projectComplexity: this.scoreProjects(resumeData),
      industryFit: 7,
      careerProgression: this.scoreCareerProgression(resumeData),
      certifications: this.scoreCertifications(resumeData)
    };

    const overallScore = Math.round(
      Object.values(scores).reduce((sum, score) => sum + score, 0)
    );

    return {
      scores,
      overallScore,
      strengths: this.identifyStrengths(resumeData, scores),
      improvements: this.identifyImprovements(resumeData, scores),
      suggestions: this.generateSuggestions(resumeData, scores)
    };
  }

  /**
   * Rule-based scoring methods
   */
  scoreContentQuality(data) {
    let score = 5;
    if (data.summary && data.summary.length > 50) score += 2;
    if (data.email && data.phone) score += 1;
    if (data.name) score += 1;
    if (data.experience && data.experience.length > 0) score += 1;
    return Math.min(score, 10);
  }

  scoreSkillRelevance(data) {
    const relevantSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 
      'MongoDB', 'SQL', 'Git', 'Docker', 'AWS'
    ];
    
    let matchCount = 0;
    if (data.skills) {
      const allSkills = [
        ...(data.skills.technical || []),
        ...(data.skills.languages || []),
        ...(data.skills.frameworks || []),
        ...(data.skills.tools || [])
      ];
      
      matchCount = relevantSkills.filter(skill => 
        allSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      ).length;
    }
    
    return Math.min(Math.round((matchCount / relevantSkills.length) * 10), 10);
  }

  scoreExperience(data) {
    if (!data.experience || data.experience.length === 0) return 2;
    
    const experienceCount = data.experience.length;
    if (experienceCount >= 3) return 9;
    if (experienceCount === 2) return 7;
    return 5;
  }

  scoreEducation(data) {
    if (!data.education || data.education.length === 0) return 3;
    
    const hasBachelor = data.education.some(edu => 
      edu.degree && edu.degree.toLowerCase().includes('bachelor')
    );
    const hasMaster = data.education.some(edu => 
      edu.degree && edu.degree.toLowerCase().includes('master')
    );
    
    if (hasMaster) return 10;
    if (hasBachelor) return 8;
    return 6;
  }

  scoreKeywords(data) {
    const keywords = ['agile', 'scrum', 'ci/cd', 'api', 'microservices', 'cloud', 'devops'];
    const text = JSON.stringify(data).toLowerCase();
    const matchCount = keywords.filter(kw => text.includes(kw)).length;
    return Math.min(Math.round((matchCount / keywords.length) * 10), 10);
  }

  scoreProjects(data) {
    if (!data.projects || data.projects.length === 0) return 3;
    
    const projectCount = data.projects.length;
    if (projectCount >= 3) return 9;
    if (projectCount === 2) return 7;
    return 5;
  }

  scoreCareerProgression(data) {
    if (!data.experience || data.experience.length < 2) return 5;
    
    // Check if positions show growth
    const positions = data.experience.map(exp => exp.position?.toLowerCase() || '');
    const hasLeadership = positions.some(pos => 
      pos.includes('senior') || pos.includes('lead') || pos.includes('principal')
    );
    
    return hasLeadership ? 9 : 6;
  }

  scoreCertifications(data) {
    if (!data.certifications || data.certifications.length === 0) return 3;
    
    const certCount = data.certifications.length;
    if (certCount >= 3) return 10;
    if (certCount === 2) return 7;
    return 5;
  }

  identifyStrengths(data, scores) {
    const strengths = [];
    
    if (scores.skillRelevance >= 7) {
      strengths.push('Strong technical skill set relevant to the role');
    }
    if (scores.experienceLevel >= 7) {
      strengths.push('Solid work experience with relevant projects');
    }
    if (scores.educationAlignment >= 8) {
      strengths.push('Excellent educational background');
    }
    if (scores.certifications >= 7) {
      strengths.push('Active in professional development and certifications');
    }
    
    if (strengths.length === 0) {
      strengths.push('Good foundation for career growth');
    }
    
    return strengths.slice(0, 3);
  }

  identifyImprovements(data, scores) {
    const improvements = [];
    
    if (scores.skillRelevance < 7) {
      improvements.push('Add more industry-relevant technical skills');
    }
    if (scores.projectComplexity < 7) {
      improvements.push('Include more detailed project descriptions and outcomes');
    }
    if (scores.certifications < 5) {
      improvements.push('Consider obtaining relevant certifications');
    }
    if (scores.contentQuality < 7) {
      improvements.push('Enhance resume formatting and professional presentation');
    }
    
    if (improvements.length === 0) {
      improvements.push('Continue building on current strengths');
    }
    
    return improvements.slice(0, 3);
  }

  generateSuggestions(data, scores) {
    const suggestions = [];
    
    if (scores.skillRelevance < 8) {
      suggestions.push('Learn trending technologies in your field');
    }
    if (scores.projectComplexity < 7) {
      suggestions.push('Work on 2-3 substantial projects demonstrating your skills');
    }
    if (scores.certifications < 6) {
      suggestions.push('Pursue industry-recognized certifications');
    }
    
    suggestions.push('Tailor your resume to specific job descriptions');
    
    return suggestions.slice(0, 3);
  }

  getDefaultScoreStructure() {
    return {
      scores: {
        contentQuality: 7,
        skillRelevance: 7,
        experienceLevel: 7,
        educationAlignment: 7,
        formatting: 7,
        keywordMatch: 7,
        projectComplexity: 7,
        industryFit: 7,
        careerProgression: 7,
        certifications: 7
      },
      overallScore: 70,
      strengths: ['Professional presentation', 'Clear structure', 'Good foundation'],
      improvements: ['Add more specific achievements', 'Quantify results', 'Highlight key projects'],
      suggestions: ['Tailor resume to job description', 'Include metrics and outcomes', 'Update with recent skills']
    };
  }

  /**
   * Generate learning suggestions based on skill gaps
   */
  async generateLearningSuggestions(missingSkills) {
    try {
      const prompt = `As a career advisor, suggest learning resources and roadmap for acquiring these skills: ${missingSkills.join(', ')}. 

Provide specific, actionable recommendations including:
1. Online courses (Coursera, Udemy, etc.)
2. Documentation and tutorials
3. Practice projects
4. Estimated time to learn each skill

Format as JSON array of recommendations.`;

      const response = await this.hf.textGeneration({
        model: this.llmModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7
        }
      });

      return response.generated_text;
    } catch (error) {
      console.error('Learning suggestions error:', error);
      return this.getDefaultLearningSuggestions(missingSkills);
    }
  }

  getDefaultLearningSuggestions(skills) {
    return skills.map(skill => ({
      skill,
      resources: [
        `Official ${skill} documentation`,
        `${skill} course on Udemy or Coursera`,
        `YouTube tutorials for ${skill}`
      ],
      estimatedTime: '2-4 weeks',
      priority: 'medium'
    }));
  }
}

export default new HuggingFaceService();
