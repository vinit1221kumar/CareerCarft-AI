import Resume from '../models/Resume.js';
import User from '../models/User.js';
import SkillGap from '../models/SkillGap.js';
import Roadmap from '../models/Roadmap.js';
import AdminReport from '../models/AdminReport.js';

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get basic counts
    const totalResumes = await Resume.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalSkillGaps = await SkillGap.countDocuments();
    const totalRoadmaps = await Roadmap.countDocuments();

    // Get average score
    const scoreAgg = await Resume.aggregate([
      { $match: { score: { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$score' }, medianScore: { $avg: '$score' } } }
    ]);

    const averageScore = scoreAgg[0]?.avgScore || 0;
    const medianScore = scoreAgg[0]?.medianScore || 0;

    // Score distribution
    const scoreDistribution = {
      excellent: await Resume.countDocuments({ score: { $gte: 90 } }),
      good: await Resume.countDocuments({ score: { $gte: 75, $lt: 90 } }),
      average: await Resume.countDocuments({ score: { $gte: 60, $lt: 75 } }),
      belowAverage: await Resume.countDocuments({ score: { $gte: 40, $lt: 60 } }),
      poor: await Resume.countDocuments({ score: { $lt: 40 } })
    };

    res.json({
      statistics: {
        totalResumes,
        totalUsers,
        totalSkillGaps,
        totalRoadmaps,
        averageScore: Math.round(averageScore),
        medianScore: Math.round(medianScore),
        scoreDistribution
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

/**
 * Get top 10 skill gaps
 */
export const getTopSkillGaps = async (req, res) => {
  try {
    const skillGaps = await SkillGap.find();
    
    // Aggregate missing skills
    const skillFrequency = new Map();
    const skillCategories = new Map();
    const skillRoles = new Map();

    skillGaps.forEach(gap => {
      gap.missingSkills.forEach(({ skill, category }) => {
        // Count frequency
        skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
        
        // Store category
        if (!skillCategories.has(skill)) {
          skillCategories.set(skill, category);
        }

        // Track roles
        if (!skillRoles.has(skill)) {
          skillRoles.set(skill, new Set());
        }
        skillRoles.get(skill).add(gap.targetRole);
      });
    });

    // Convert to array and sort by frequency
    const topSkills = Array.from(skillFrequency.entries())
      .map(([skill, frequency]) => ({
        skill,
        frequency,
        percentage: Math.round((frequency / skillGaps.length) * 100),
        category: skillCategories.get(skill),
        targetRoles: Array.from(skillRoles.get(skill) || [])
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    res.json({ topSkillGaps: topSkills });
  } catch (error) {
    console.error('Top skill gaps error:', error);
    res.status(500).json({ message: 'Error fetching top skill gaps' });
  }
};

/**
 * Get role-specific analytics
 */
export const getRoleAnalytics = async (req, res) => {
  try {
    const roles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'Full Stack Developer'];
    const roleAnalytics = [];

    for (const role of roles) {
      const resumes = await Resume.find({ targetRole: role, score: { $exists: true } });
      const skillGaps = await SkillGap.find({ targetRole: role });

      if (resumes.length === 0) continue;

      const avgScore = resumes.reduce((sum, r) => sum + r.score, 0) / resumes.length;
      const avgSkillMatch = skillGaps.length > 0
        ? skillGaps.reduce((sum, sg) => sum + sg.overallMatch, 0) / skillGaps.length
        : 0;

      // Get top missing skills for this role
      const missingSkillsMap = new Map();
      skillGaps.forEach(sg => {
        sg.missingSkills.forEach(({ skill }) => {
          missingSkillsMap.set(skill, (missingSkillsMap.get(skill) || 0) + 1);
        });
      });

      const topMissingSkills = Array.from(missingSkillsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill]) => skill);

      roleAnalytics.push({
        role,
        count: resumes.length,
        averageScore: Math.round(avgScore),
        topMissingSkills,
        averageSkillMatch: Math.round(avgSkillMatch)
      });
    }

    res.json({ roleAnalytics });
  } catch (error) {
    console.error('Role analytics error:', error);
    res.status(500).json({ message: 'Error fetching role analytics' });
  }
};

/**
 * Get common strengths and improvements
 */
export const getCommonFeedback = async (req, res) => {
  try {
    const resumes = await Resume.find({ 'feedback.strengths': { $exists: true } });

    const strengthsMap = new Map();
    const improvementsMap = new Map();

    resumes.forEach(resume => {
      resume.feedback.strengths?.forEach(strength => {
        strengthsMap.set(strength, (strengthsMap.get(strength) || 0) + 1);
      });

      resume.feedback.improvements?.forEach(improvement => {
        improvementsMap.set(improvement, (improvementsMap.get(improvement) || 0) + 1);
      });
    });

    const commonStrengths = Array.from(strengthsMap.entries())
      .map(([strength, frequency]) => ({
        strength,
        frequency,
        percentage: Math.round((frequency / resumes.length) * 100)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    const commonImprovements = Array.from(improvementsMap.entries())
      .map(([area, frequency]) => ({
        area,
        frequency,
        percentage: Math.round((frequency / resumes.length) * 100)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    res.json({ commonStrengths, commonImprovements });
  } catch (error) {
    console.error('Common feedback error:', error);
    res.status(500).json({ message: 'Error fetching common feedback' });
  }
};

/**
 * Generate comprehensive admin report
 */
export const generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get all data
    const resumes = await Resume.find(query);
    const users = await User.countDocuments({ role: 'student' });
    const skillGaps = await SkillGap.find(query);
    const roadmaps = await Roadmap.find(query);

    // Calculate statistics
    const scores = resumes.filter(r => r.score).map(r => r.score);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const medianScore = scores.length > 0 ? scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)] : 0;

    const scoreDistribution = {
      excellent: resumes.filter(r => r.score >= 90).length,
      good: resumes.filter(r => r.score >= 75 && r.score < 90).length,
      average: resumes.filter(r => r.score >= 60 && r.score < 75).length,
      belowAverage: resumes.filter(r => r.score >= 40 && r.score < 60).length,
      poor: resumes.filter(r => r.score < 40).length
    };

    // Top skill gaps
    const skillFrequency = new Map();
    skillGaps.forEach(gap => {
      gap.missingSkills.forEach(({ skill, category }) => {
        if (!skillFrequency.has(skill)) {
          skillFrequency.set(skill, { count: 0, category, roles: new Set() });
        }
        const data = skillFrequency.get(skill);
        data.count++;
        data.roles.add(gap.targetRole);
      });
    });

    const topSkillGaps = Array.from(skillFrequency.entries())
      .map(([skill, data]) => ({
        skill,
        category: data.category,
        frequency: data.count,
        percentage: Math.round((data.count / skillGaps.length) * 100),
        targetRoles: Array.from(data.roles)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Roadmap analytics
    const completedMilestones = roadmaps.reduce((sum, r) => sum + r.progress.completedMilestones, 0);
    const totalMilestones = roadmaps.reduce((sum, r) => sum + r.progress.totalMilestones, 0);
    const avgCompletionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    // Create report
    const report = new AdminReport({
      reportType: 'aggregate',
      period: {
        startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date()
      },
      statistics: {
        totalResumesProcessed: resumes.length,
        totalUsers: users,
        averageScore: Math.round(averageScore),
        medianScore: Math.round(medianScore),
        scoreDistribution
      },
      topSkillGaps,
      roadmapAnalytics: {
        totalRoadmapsGenerated: roadmaps.length,
        averageCompletionRate: Math.round(avgCompletionRate),
        popularMilestones: []
      },
      generatedBy: req.user.id
    });

    await report.save();

    res.json({
      message: 'Report generated successfully',
      reportId: report._id,
      report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('resumeSubmissions')
      .sort({ createdAt: -1 });

    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

/**
 * Get all resumes (admin only)
 */
export const getAllResumes = async (req, res) => {
  try {
    const { page = 1, limit = 20, targetRole, status } = req.query;

    const query = {};
    if (targetRole) query.targetRole = targetRole;
    if (status) query.processingStatus = status;

    const resumes = await Resume.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Resume.countDocuments(query);

    res.json({
      resumes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    console.error('Get all resumes error:', error);
    res.status(500).json({ message: 'Error fetching resumes' });
  }
};
