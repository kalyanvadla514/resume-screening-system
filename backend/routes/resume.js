const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from DOCX
async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// Parse resume using ML service
async function parseResumeWithML(text) {
  try {
    const response = await axios.post(
      `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/api/parse-resume`,
      { text },
      { timeout: 30000 }
    );
    return response.data;
  } catch (error) {
    console.error('ML parsing error:', error);
    // Return basic parsed data if ML service fails
    return {
      skills: extractBasicSkills(text),
      experience: 0,
      education: []
    };
  }
}

// Basic skill extraction (fallback)
function extractBasicSkills(text) {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'C\\+\\+', 'React', 'Node\\.js', 'Angular', 
    'Vue', 'MongoDB', 'SQL', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 
    'Kubernetes', 'Git', 'Machine Learning', 'Deep Learning', 'NLP', 'TensorFlow',
    'PyTorch', 'HTML', 'CSS', 'REST API', 'GraphQL', 'Express', 'Django', 'Flask'
  ];
  
  const foundSkills = [];
  commonSkills.forEach(skill => {
    const regex = new RegExp(skill, 'gi');
    if (regex.test(text)) {
      foundSkills.push(skill.replace(/\\/g, ''));
    }
  });
  
  return [...new Set(foundSkills)];
}

// @route   POST /api/resumes/upload
// @desc    Upload and parse resume
// @access  Private
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'Please upload a resume file' 
      });
    }

    const { candidateName, email, phone } = req.body;

    // Extract text based on file type
    let extractedText;
    const fileType = path.extname(req.file.originalname).toLowerCase().substring(1);
    
    if (fileType === 'pdf') {
      extractedText = await extractTextFromPDF(req.file.path);
    } else if (fileType === 'docx' || fileType === 'doc') {
      extractedText = await extractTextFromDOCX(req.file.path);
    }

    // Parse resume using ML service
    const parsedData = await parseResumeWithML(extractedText);

    // Create resume record
    const resume = await Resume.create({
      candidateName: candidateName || 'Unknown',
      email: email || 'noemail@provided.com',
      phone: phone || '',
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileType: fileType,
      extractedText: extractedText,
      skills: parsedData.skills || [],
      experience: parsedData.experience || 0,
      education: parsedData.education || [],
      certifications: parsedData.certifications || [],
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      resume: {
        id: resume._id,
        candidateName: resume.candidateName,
        email: resume.email,
        skills: resume.skills,
        experience: resume.experience
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error uploading resume',
      error: error.message 
    });
  }
});

// @route   GET /api/resumes
// @desc    Get all resumes with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, skills, minExperience, maxExperience, status, page = 1, limit = 10 } = req.query;
    
    let query = { status: status || 'active' };

    // Search filter
    if (search) {
      query.$or = [
        { candidateName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray };
    }

    // Experience filter
    if (minExperience || maxExperience) {
      query.experience = {};
      if (minExperience) query.experience.$gte = parseInt(minExperience);
      if (maxExperience) query.experience.$lte = parseInt(maxExperience);
    }

    const resumes = await Resume.find(query)
      .populate('uploadedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Resume.countDocuments(query);

    res.status(200).json({
      success: true,
      resumes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching resumes',
      error: error.message 
    });
  }
});

// @route   GET /api/resumes/:id
// @desc    Get single resume
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('jobApplications.jobId', 'title department');

    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      });
    }

    res.status(200).json({
      success: true,
      resume
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching resume',
      error: error.message 
    });
  }
});

// @route   POST /api/resumes/:id/match/:jobId
// @desc    Match resume with job and calculate score
// @access  Private
router.post('/:id/match/:jobId', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    const job = await Job.findById(req.params.jobId);

    if (!resume || !job) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume or Job not found' 
      });
    }

    // Call ML service for matching
    try {
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

      // Update resume with job application
      const existingApp = resume.jobApplications.find(
        app => app.jobId.toString() === job._id.toString()
      );

      if (!existingApp) {
        resume.jobApplications.push({
          jobId: job._id,
          matchScore: matchScore,
          status: 'pending'
        });
        
        job.applicantsCount += 1;
        await job.save();
      }

      await resume.save();

      res.status(200).json({
        success: true,
        message: 'Resume matched with job successfully',
        matchScore: matchScore,
        recommendation: matchScore >= 70 ? 'Highly Recommended' : matchScore >= 50 ? 'Recommended' : 'Review Required'
      });
    } catch (mlError) {
      // Fallback to basic matching if ML service fails
      const matchScore = calculateBasicMatch(resume.skills, job.requiredSkills);
      
      resume.jobApplications.push({
        jobId: job._id,
        matchScore: matchScore,
        status: 'pending'
      });
      
      await resume.save();
      
      res.status(200).json({
        success: true,
        message: 'Resume matched with job (basic matching)',
        matchScore: matchScore
      });
    }
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error matching resume with job',
      error: error.message 
    });
  }
});

// Basic matching algorithm (fallback)
function calculateBasicMatch(candidateSkills, requiredSkills) {
  if (!candidateSkills || candidateSkills.length === 0) return 0;
  if (!requiredSkills || requiredSkills.length === 0) return 0;

  let totalWeight = 0;
  let matchedWeight = 0;

  requiredSkills.forEach(reqSkill => {
    const weight = reqSkill.weight || 5;
    totalWeight += weight;
    
    const hasSkill = candidateSkills.some(
      skill => skill.toLowerCase() === reqSkill.skill.toLowerCase()
    );
    
    if (hasSkill) {
      matchedWeight += weight;
    }
  });

  return Math.round((matchedWeight / totalWeight) * 100);
}

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ 
        success: false,
        message: 'Resume not found' 
      });
    }

    // Delete file
    try {
      await fs.unlink(resume.fileUrl);
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting resume',
      error: error.message 
    });
  }
});

module.exports = router;
