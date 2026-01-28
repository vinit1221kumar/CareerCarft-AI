import Resume from '../models/Resume.js';
import SkillGap from '../models/SkillGap.js';
import Roadmap from '../models/Roadmap.js';
import User from '../models/User.js';
import resumeParserService from '../services/resumeParser.js';
import huggingfaceService from '../services/huggingface.js';
import skillGapService from '../services/skillGapAnalysis.js';
import roadmapService from '../services/roadmapGenerator.js';
import fs from 'fs';

/**
 * Upload and parse resume
 */
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { targetRole } = req.body;
    const userId = req.user.id;

    // Create resume record
    const resume = new Resume({
      userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      targetRole: targetRole || 'Software Engineer',
      processingStatus: 'processing'
    });

    await resume.save();

    // Parse resume in background
    parseResumeAsync(resume._id, req.file.path, targetRole);

    res.status(202).json({
      message: 'Resume uploaded successfully. Processing started.',
      resumeId: resume._id
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Error uploading resume' });
  }
};

/**
 * Async function to parse and analyze resume
 */
async function parseResumeAsync(resumeId, filePath, targetRole) {
  try {
    const resume = await Resume.findById(resumeId);
    
    // Parse resume
    const parsedData = await resumeParserService.parseResume(filePath);
    resume.parsedData = parsedData;

    // Score resume using AI
    const scoreResult = await huggingfaceService.scoreResume(parsedData, targetRole);
    resume.score = scoreResult.overallScore;
    resume.scoreBreakdown = scoreResult.scores;
    resume.feedback = {
      strengths: scoreResult.strengths,
      improvements: scoreResult.improvements,
      suggestions: scoreResult.suggestions
    };

    resume.processingStatus = 'completed';
    await resume.save();

    // Update user's resume submissions
    await User.findByIdAndUpdate(resume.userId, {
      $push: { resumeSubmissions: resume._id }
    });

    console.log(`Resume ${resumeId} processed successfully`);
  } catch (error) {
    console.error('Parse resume async error:', error);
    await Resume.findByIdAndUpdate(resumeId, {
      processingStatus: 'failed'
    });
  }
}

/**
 * Get resume by ID
 */
export const getResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Check if user owns this resume or is admin
    if (resume.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ resume });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Error fetching resume' });
  }
};

/**
 * Get all resumes for current user
 */
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ resumes, count: resumes.length });
  } catch (error) {
    console.error('Get user resumes error:', error);
    res.status(500).json({ message: 'Error fetching resumes' });
  }
};

/**
 * Analyze skill gap
 */
export const analyzeSkillGap = async (req, res) => {
  try {
    const { resumeId, targetRole } = req.body;

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Check ownership
    if (resume.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Perform skill gap analysis
    const analysis = await skillGapService.analyzeSkillGap(
      resume.parsedData,
      targetRole || resume.targetRole
    );

    // Save skill gap analysis
    const skillGap = new SkillGap({
      resumeId: resume._id,
      userId: req.user.id,
      targetRole: targetRole || resume.targetRole,
      currentSkills: analysis.currentSkills,
      requiredSkills: analysis.requiredSkills,
      missingSkills: analysis.missingSkills,
      matchingSkills: analysis.matchingSkills,
      overallMatch: analysis.overallMatch,
      skillCoverage: analysis.skillCoverage,
      recommendations: analysis.recommendations,
      skillEmbeddings: analysis.skillEmbeddings
    });

    await skillGap.save();

    res.json({
      message: 'Skill gap analysis completed',
      skillGapId: skillGap._id,
      analysis: {
        overallMatch: analysis.overallMatch,
        skillCoverage: analysis.skillCoverage,
        missingSkills: analysis.missingSkills,
        recommendations: analysis.recommendations
      }
    });
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({ message: 'Error analyzing skill gap' });
  }
};

/**
 * Generate learning roadmap
 */
export const generateRoadmap = async (req, res) => {
  try {
    const { skillGapId, weeks } = req.body;

    const skillGap = await SkillGap.findById(skillGapId);
    if (!skillGap) {
      return res.status(404).json({ message: 'Skill gap analysis not found' });
    }

    // Check ownership
    if (skillGap.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const resume = await Resume.findById(skillGap.resumeId);

    // Generate roadmap
    const roadmapData = await roadmapService.generateRoadmap(
      {
        missingSkills: skillGap.missingSkills,
        recommendations: skillGap.recommendations,
        currentSkills: skillGap.currentSkills
      },
      resume.parsedData,
      skillGap.targetRole,
      weeks || 6
    );

    // Save roadmap
    const roadmap = new Roadmap({
      userId: req.user.id,
      resumeId: resume._id,
      skillGapId: skillGap._id,
      targetRole: skillGap.targetRole,
      ...roadmapData
    });

    await roadmap.save();

    res.json({
      message: 'Roadmap generated successfully',
      roadmapId: roadmap._id,
      roadmap
    });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({ message: 'Error generating roadmap' });
  }
};

/**
 * Get roadmap by ID
 */
export const getRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const roadmap = await Roadmap.findById(id)
      .populate('resumeId')
      .populate('skillGapId');

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Check ownership
    if (roadmap.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ roadmap });
  } catch (error) {
    console.error('Get roadmap error:', error);
    res.status(500).json({ message: 'Error fetching roadmap' });
  }
};

/**
 * Update roadmap progress
 */
export const updateRoadmapProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { weekNumber, milestoneIndex, status } = req.body;

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Check ownership
    if (roadmap.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update milestone status
    const week = roadmap.weeks.find(w => w.weekNumber === weekNumber);
    if (week && week.milestones[milestoneIndex]) {
      week.milestones[milestoneIndex].status = status;
      
      if (status === 'completed') {
        week.milestones[milestoneIndex].completedAt = new Date();
        roadmap.progress.completedMilestones += 1;
      }
    }

    // Update current week
    roadmap.progress.currentWeek = weekNumber;

    await roadmap.save();

    res.json({
      message: 'Progress updated successfully',
      progress: roadmap.progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Error updating progress' });
  }
};

/**
 * Delete resume
 */
export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Check ownership
    if (resume.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete file
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    // Delete related data
    await SkillGap.deleteMany({ resumeId: resume._id });
    await Roadmap.deleteMany({ resumeId: resume._id });
    await resume.deleteOne();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Error deleting resume' });
  }
};
