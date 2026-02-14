const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get counts
    const totalResumes = await Resume.countDocuments({ status: 'active' });
    const totalJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Resume.aggregate([
      { $unwind: '$jobApplications' },
      { $count: 'total' }
    ]);

    // Get resumes by status
    const resumesByStatus = await Resume.aggregate([
      { $unwind: '$jobApplications' },
      {
        $group: {
          _id: '$jobApplications.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top skills
    const topSkills = await Resume.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get recent activity
    const recentResumes = await Resume.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('candidateName email createdAt skills');

    const recentJobs = await Job.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title department createdAt applicantsCount');

    // Get jobs with most applications
    const topJobs = await Job.find({ status: 'active' })
      .sort({ applicantsCount: -1 })
      .limit(5)
      .select('title department applicantsCount');

    // Calculate average match scores
    const avgMatchScores = await Resume.aggregate([
      { $unwind: '$jobApplications' },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$jobApplications.matchScore' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalResumes,
          totalJobs,
          totalApplications: totalApplications.length > 0 ? totalApplications[0].total : 0,
          avgMatchScore: avgMatchScores.length > 0 ? Math.round(avgMatchScores[0].avgScore) : 0
        },
        resumesByStatus,
        topSkills,
        topJobs,
        recentActivity: {
          resumes: recentResumes,
          jobs: recentJobs
        }
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching analytics',
      error: error.message 
    });
  }
});

// @route   GET /api/analytics/skills
// @desc    Get skill analytics
// @access  Private
router.get('/skills', protect, async (req, res) => {
  try {
    const skillsAnalysis = await Resume.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 },
          avgExperience: { $avg: '$experience' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      skills: skillsAnalysis
    });
  } catch (error) {
    console.error('Skills analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching skill analytics',
      error: error.message 
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get hiring trends over time
// @access  Private
router.get('/trends', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Resumes uploaded over time
    const resumeTrends = await Resume.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Jobs posted over time
    const jobTrends = await Job.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      trends: {
        resumes: resumeTrends,
        jobs: jobTrends
      }
    });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching trends',
      error: error.message 
    });
  }
});

// @route   GET /api/analytics/job/:id
// @desc    Get analytics for specific job
// @access  Private
router.get('/job/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Get all candidates for this job
    const candidates = await Resume.aggregate([
      {
        $match: {
          'jobApplications.jobId': job._id
        }
      },
      { $unwind: '$jobApplications' },
      {
        $match: {
          'jobApplications.jobId': job._id
        }
      },
      {
        $group: {
          _id: '$jobApplications.status',
          count: { $sum: 1 },
          avgMatchScore: { $avg: '$jobApplications.matchScore' }
        }
      }
    ]);

    // Get match score distribution
    const scoreDistribution = await Resume.aggregate([
      {
        $match: {
          'jobApplications.jobId': job._id
        }
      },
      { $unwind: '$jobApplications' },
      {
        $match: {
          'jobApplications.jobId': job._id
        }
      },
      {
        $bucket: {
          groupBy: '$jobApplications.matchScore',
          boundaries: [0, 30, 50, 70, 90, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      jobTitle: job.title,
      analytics: {
        candidatesByStatus: candidates,
        scoreDistribution,
        totalApplicants: job.applicantsCount,
        views: job.views
      }
    });
  } catch (error) {
    console.error('Job analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching job analytics',
      error: error.message 
    });
  }
});

module.exports = router;
