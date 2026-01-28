import fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import natural from 'natural';
import nlp from 'compromise';

class ResumeParserService {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
  }

  /**
   * Main parsing function - determines file type and extracts text
   */
  async parseResume(filePath) {
    try {
      const fileExtension = filePath.split('.').pop().toLowerCase();
      let text = '';

      if (fileExtension === 'pdf') {
        text = await this.parsePDF(filePath);
      } else if (fileExtension === 'docx') {
        text = await this.parseDOCX(filePath);
      } else {
        throw new Error('Unsupported file format');
      }

      // Extract structured data from text
      const parsedData = await this.extractFields(text);
      return parsedData;
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }

  /**
   * Parse PDF files
   */
  async parsePDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  /**
   * Parse DOCX files
   */
  async parseDOCX(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  /**
   * Extract 20+ structured fields from resume text
   */
  async extractFields(text) {
    const doc = nlp(text);

    return {
      // Personal Information
      name: this.extractName(text, doc),
      email: this.extractEmail(text),
      phone: this.extractPhone(text),
      location: this.extractLocation(text, doc),
      linkedin: this.extractURL(text, 'linkedin'),
      github: this.extractURL(text, 'github'),
      portfolio: this.extractPortfolio(text),

      // Professional Summary
      summary: this.extractSummary(text),
      objective: this.extractObjective(text),

      // Education
      education: this.extractEducation(text, doc),

      // Work Experience
      experience: this.extractExperience(text, doc),

      // Skills
      skills: this.extractSkills(text, doc),

      // Projects
      projects: this.extractProjects(text),

      // Certifications
      certifications: this.extractCertifications(text),

      // Awards
      awards: this.extractAwards(text),

      // Publications
      publications: this.extractPublications(text),

      // Languages
      spokenLanguages: this.extractLanguages(text),

      // Volunteer Experience
      volunteer: this.extractVolunteer(text)
    };
  }

  /**
   * Extract name (usually first line or near "NAME" keyword)
   */
  extractName(text, doc) {
    // Try to find name at the beginning
    const lines = text.split('\n').filter(line => line.trim());
    const firstLine = lines[0]?.trim();
    
    // Check if first line looks like a name (2-4 words, capitalized)
    const namePattern = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/;
    if (namePattern.test(firstLine)) {
      return firstLine;
    }

    // Try using compromise to find person names
    const people = doc.people().out('array');
    if (people.length > 0) {
      return people[0];
    }

    return firstLine || '';
  }

  /**
   * Extract email address
   */
  extractEmail(text) {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailPattern);
    return match ? match[0] : '';
  }

  /**
   * Extract phone number
   */
  extractPhone(text) {
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const match = text.match(phonePattern);
    return match ? match[0] : '';
  }

  /**
   * Extract location
   */
  extractLocation(text, doc) {
    const places = doc.places().out('array');
    return places.length > 0 ? places[0] : '';
  }

  /**
   * Extract URLs (LinkedIn, GitHub, etc.)
   */
  extractURL(text, type) {
    const patterns = {
      linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i,
      github: /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i
    };
    
    const match = text.match(patterns[type]);
    return match ? match[0] : '';
  }

  /**
   * Extract portfolio URL
   */
  extractPortfolio(text) {
    const urlPattern = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g;
    const urls = text.match(urlPattern) || [];
    
    // Filter out common sites (linkedin, github, email domains)
    const portfolio = urls.find(url => 
      !url.includes('linkedin') && 
      !url.includes('github') && 
      !url.includes('gmail') &&
      !url.includes('outlook')
    );
    
    return portfolio || '';
  }

  /**
   * Extract professional summary
   */
  extractSummary(text) {
    const summaryPattern = /(?:SUMMARY|PROFILE|ABOUT|OBJECTIVE)[\s\S]*?\n\n([\s\S]*?)(?:\n\n|EXPERIENCE|EDUCATION|SKILLS)/i;
    const match = text.match(summaryPattern);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract objective
   */
  extractObjective(text) {
    const objectivePattern = /OBJECTIVE[\s\S]*?\n\n([\s\S]*?)(?:\n\n|EXPERIENCE|EDUCATION|SKILLS)/i;
    const match = text.match(objectivePattern);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract education details
   */
  extractEducation(text, doc) {
    const education = [];
    const eduSection = this.extractSection(text, ['EDUCATION', 'ACADEMIC', 'QUALIFICATION']);
    
    if (eduSection) {
      // Split by degree patterns
      const entries = eduSection.split(/(?=Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Associate)/gi);
      
      entries.forEach(entry => {
        if (entry.trim()) {
          education.push({
            institution: this.extractInstitution(entry),
            degree: this.extractDegree(entry),
            field: this.extractField(entry),
            graduationDate: this.extractDate(entry),
            gpa: this.extractGPA(entry),
            achievements: []
          });
        }
      });
    }
    
    return education;
  }

  /**
   * Extract work experience
   */
  extractExperience(text, doc) {
    const experience = [];
    const expSection = this.extractSection(text, ['EXPERIENCE', 'WORK HISTORY', 'EMPLOYMENT', 'PROFESSIONAL EXPERIENCE']);
    
    if (expSection) {
      // Split by company or position patterns
      const entries = expSection.split(/\n(?=[A-Z][^\n]*(?:Engineer|Developer|Manager|Analyst|Consultant|Designer))/);
      
      entries.forEach(entry => {
        if (entry.trim().length > 20) {
          const lines = entry.split('\n').filter(l => l.trim());
          experience.push({
            company: this.extractCompany(entry),
            position: lines[0] || '',
            duration: this.extractDuration(entry),
            startDate: '',
            endDate: '',
            responsibilities: this.extractBulletPoints(entry),
            achievements: []
          });
        }
      });
    }
    
    return experience;
  }

  /**
   * Extract skills (categorized)
   */
  extractSkills(text, doc) {
    const skillsSection = this.extractSection(text, ['SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES']);
    
    const skills = {
      technical: [],
      soft: [],
      tools: [],
      languages: [],
      frameworks: [],
      databases: []
    };

    if (skillsSection) {
      // Common programming languages
      const langPattern = /\b(JavaScript|Python|Java|C\+\+|C#|Ruby|Go|Rust|Swift|Kotlin|TypeScript|PHP|Scala|R|MATLAB)\b/gi;
      skills.languages = [...new Set((skillsSection.match(langPattern) || []).map(s => s.trim()))];

      // Frameworks
      const frameworkPattern = /\b(React|Angular|Vue|Django|Flask|Spring|Express|FastAPI|Laravel|Rails|Next\.js|Nuxt\.js|Svelte)\b/gi;
      skills.frameworks = [...new Set((skillsSection.match(frameworkPattern) || []).map(s => s.trim()))];

      // Databases
      const dbPattern = /\b(MongoDB|PostgreSQL|MySQL|Redis|Cassandra|DynamoDB|Firebase|Oracle|SQL Server|SQLite)\b/gi;
      skills.databases = [...new Set((skillsSection.match(dbPattern) || []).map(s => s.trim()))];

      // Tools
      const toolPattern = /\b(Git|Docker|Kubernetes|AWS|Azure|GCP|Jenkins|CircleCI|Terraform|Ansible|Jira|Figma|VS Code)\b/gi;
      skills.tools = [...new Set((skillsSection.match(toolPattern) || []).map(s => s.trim()))];

      // Get all skills mentioned
      const allSkills = skillsSection.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 2 && s.length < 30);
      
      // Technical skills (not already categorized)
      skills.technical = allSkills.filter(skill => 
        !skills.languages.includes(skill) &&
        !skills.frameworks.includes(skill) &&
        !skills.databases.includes(skill) &&
        !skills.tools.includes(skill)
      ).slice(0, 15);
    }

    return skills;
  }

  /**
   * Extract projects
   */
  extractProjects(text) {
    const projects = [];
    const projectSection = this.extractSection(text, ['PROJECTS', 'PROJECT EXPERIENCE', 'NOTABLE PROJECTS']);
    
    if (projectSection) {
      const entries = projectSection.split(/\n(?=[A-Z][^\n]{10,80}\n)/);
      
      entries.forEach(entry => {
        if (entry.trim().length > 20) {
          projects.push({
            name: entry.split('\n')[0]?.trim() || '',
            description: this.extractDescription(entry),
            technologies: this.extractTechnologies(entry),
            link: this.extractURL(entry, 'github'),
            duration: ''
          });
        }
      });
    }
    
    return projects;
  }

  /**
   * Extract certifications
   */
  extractCertifications(text) {
    const certifications = [];
    const certSection = this.extractSection(text, ['CERTIFICATIONS', 'CERTIFICATES', 'LICENSES']);
    
    if (certSection) {
      const lines = certSection.split('\n').filter(l => l.trim());
      
      lines.forEach(line => {
        if (line.trim().length > 5) {
          certifications.push({
            name: line.trim(),
            issuer: this.extractIssuer(line),
            date: this.extractDate(line),
            credentialId: ''
          });
        }
      });
    }
    
    return certifications;
  }

  /**
   * Extract awards
   */
  extractAwards(text) {
    const awardsSection = this.extractSection(text, ['AWARDS', 'HONORS', 'ACHIEVEMENTS', 'RECOGNITION']);
    if (!awardsSection) return [];
    
    return awardsSection.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 5);
  }

  /**
   * Extract publications
   */
  extractPublications(text) {
    const publications = [];
    const pubSection = this.extractSection(text, ['PUBLICATIONS', 'RESEARCH', 'PAPERS']);
    
    if (pubSection) {
      const lines = pubSection.split('\n').filter(l => l.trim());
      
      lines.forEach(line => {
        if (line.trim().length > 10) {
          publications.push({
            title: line.trim(),
            journal: '',
            date: this.extractDate(line),
            link: ''
          });
        }
      });
    }
    
    return publications;
  }

  /**
   * Extract spoken languages
   */
  extractLanguages(text) {
    const languages = [];
    const langSection = this.extractSection(text, ['LANGUAGES']);
    
    if (langSection) {
      const commonLangs = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Hindi', 'Arabic'];
      
      commonLangs.forEach(lang => {
        if (langSection.includes(lang)) {
          languages.push({
            language: lang,
            proficiency: this.extractProficiency(langSection, lang)
          });
        }
      });
    }
    
    return languages;
  }

  /**
   * Extract volunteer experience
   */
  extractVolunteer(text) {
    const volunteer = [];
    const volSection = this.extractSection(text, ['VOLUNTEER', 'COMMUNITY SERVICE', 'EXTRACURRICULAR']);
    
    if (volSection) {
      const lines = volSection.split('\n').filter(l => l.trim());
      
      if (lines.length > 0) {
        volunteer.push({
          organization: lines[0] || '',
          role: lines[1] || '',
          duration: '',
          description: lines.slice(2).join(' ')
        });
      }
    }
    
    return volunteer;
  }

  // Helper methods

  extractSection(text, keywords) {
    for (const keyword of keywords) {
      const pattern = new RegExp(`${keyword}[:\\s]*\\n([\\s\\S]*?)(?=\\n\\n[A-Z]{3,}|$)`, 'i');
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  extractInstitution(text) {
    const lines = text.split('\n').filter(l => l.trim());
    return lines.find(line => line.length > 5 && line.length < 100) || '';
  }

  extractDegree(text) {
    const degreePattern = /(Bachelor|Master|PhD|Associate|B\.S\.|M\.S\.|B\.A\.|M\.A\.|Ph\.D\.).*?(?:in|of)?\s*([^\n,]*)/i;
    const match = text.match(degreePattern);
    return match ? match[0].trim() : '';
  }

  extractField(text) {
    const fieldPattern = /(?:in|of)\s+([A-Z][^\n,]{5,50})/;
    const match = text.match(fieldPattern);
    return match ? match[1].trim() : '';
  }

  extractDate(text) {
    const datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{4}\b|\b\d{4}\b/i;
    const match = text.match(datePattern);
    return match ? match[0] : '';
  }

  extractGPA(text) {
    const gpaPattern = /GPA:?\s*(\d\.\d{1,2})/i;
    const match = text.match(gpaPattern);
    return match ? match[1] : '';
  }

  extractCompany(text) {
    const lines = text.split('\n').filter(l => l.trim());
    return lines.find(line => line.length > 3 && line.length < 80) || '';
  }

  extractDuration(text) {
    const durationPattern = /\d{4}\s*[-–]\s*(?:\d{4}|Present|Current)/i;
    const match = text.match(durationPattern);
    return match ? match[0] : '';
  }

  extractBulletPoints(text) {
    const bulletPattern = /^[\s]*[•\-\*]\s*(.+)$/gm;
    const bullets = [];
    let match;
    
    while ((match = bulletPattern.exec(text)) !== null) {
      bullets.push(match[1].trim());
    }
    
    return bullets.slice(0, 5); // Limit to 5 bullet points
  }

  extractDescription(text) {
    const lines = text.split('\n').filter(l => l.trim());
    return lines.slice(1, 3).join(' ').trim();
  }

  extractTechnologies(text) {
    const techPattern = /\b(JavaScript|Python|Java|React|Angular|Vue|Node|Django|Flask|MongoDB|PostgreSQL|AWS|Docker|Kubernetes)\b/gi;
    const techs = text.match(techPattern) || [];
    return [...new Set(techs.map(t => t.trim()))];
  }

  extractIssuer(text) {
    const issuerPattern = /(by|from|issued by)\s+([A-Z][^\n,]{3,50})/i;
    const match = text.match(issuerPattern);
    return match ? match[2].trim() : '';
  }

  extractProficiency(text, language) {
    const profPattern = new RegExp(`${language}\\s*[:-]?\\s*(Native|Fluent|Professional|Intermediate|Basic|Beginner)`, 'i');
    const match = text.match(profPattern);
    return match ? match[1] : 'Proficient';
  }
}

export default new ResumeParserService();
