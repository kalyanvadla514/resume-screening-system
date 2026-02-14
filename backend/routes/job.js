const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { protect, authorize } = require('../middleware/auth');
const axios = require('axios');

// @route   POST /api/jobs
// @desc    Create new job posting
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating job',
      error: error.message 
    });
  }
});

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      search, 
      department, 
      employmentType, 
      experienceLevel, 
      status = 'active',
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'requiredSkills.skill': { $regex: search, $options: 'i' } }
      ];
    }

    // Department filter
    if (department) {
      query.department = department;
    }

    // Employment type filter
    if (employmentType) {
      query.employmentType = employmentType;
    }

    // Experience level filter
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email department')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      jobs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching jobs',
      error: error.message 
    });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email department company');

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching job',
      error: error.message 
    });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Check if user is authorized to update
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this job' 
      });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating job',
      error: error.message 
    });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Check if user is authorized to delete
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this job' 
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting job',
      error: error.message 
    });
  }
});

// @route   GET /api/jobs/:id/candidates
// @desc    Get ranked candidates for a job
// @access  Private
router.get('/:id/candidates', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Find all resumes that applied for this job
    const resumes = await Resume.find({
      'jobApplications.jobId': job._id,
      status: 'active'
    }).populate('uploadedBy', 'name email');

    // Extract and sort by match score
    const rankedCandidates = resumes.map(resume => {
      const application = resume.jobApplications.find(
        app => app.jobId.toString() === job._id.toString()
      );
      
      return {
        resumeId: resume._id,
        candidateName: resume.candidateName,
        email: resume.email,
        phone: resume.phone,
        skills: resume.skills,
        experience: resume.experience,
        matchScore: application.matchScore,
        status: application.status,
        appliedDate: application.appliedDate,
        education: resume.education
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      jobTitle: job.title,
      totalCandidates: rankedCandidates.length,
      candidates: rankedCandidates
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching candidates',
      error: error.message 
    });
  }
});

// @route   POST /api/jobs/:id/match-all
// @desc    Match all active resumes with a job
// @access  Private
router.post('/:id/match-all', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ 
        success: false,
        message: 'Job not found' 
      });
    }

    // Get all active resumes
    const resumes = await Resume.find({ status: 'active' });

    let matched = 0;
    let failed = 0;

    for (const resume of resumes) {
      try {
        // Check if already applied
        const alreadyApplied = resume.jobApplications.some(
          app => app.jobId.toString() === job._id.toString()
        );

        if (alreadyApplied) continue;

        // Call ML service for matching
        const response = await axios.post(
          `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/match`,
          {
            resumeText: resume.extractedText,
            jobDescription: job.description,
            requiredSkills: job.requiredSkills.map(s => s.skill),
            candidateSkills: resume.skills
          },
          { timeout: 30000 }
        );

        const matchScore = response.data.score;

        // Only add if match score is above threshold
        if (matchScore >= 30) {
          resume.jobApplications.push({
            jobId: job._id,
            matchScore: matchScore,
            status: 'pending'
          });
          
          await resume.save();
          matched++;
        }
      } catch (error) {
        console.error(`Error matching resume ${resume._id}:`, error.message);
        failed++;
      }
    }

    // Update job applicants count
    job.applicantsCount = matched;
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Batch matching completed',
      matched,
      failed,
      total: resumes.length
    });
  } catch (error) {
    console.error('Batch match error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error in batch matching',
      error: error.message 
    });
  }
});

module.exports = router;
