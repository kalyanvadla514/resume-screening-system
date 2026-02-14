const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'doc'],
    required: true
  },
  extractedText: {
    type: String
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number, // years of experience
    default: 0
  },
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  certifications: [{
    type: String
  }],
  jobApplications: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'rejected', 'interviewed', 'hired'],
      default: 'pending'
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  tags: [{
    type: String
  }],
  metadata: {
    location: String,
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String
  }
}, {
  timestamps: true
});

// Index for faster searching
resumeSchema.index({ candidateName: 'text', email: 'text', skills: 'text' });
resumeSchema.index({ 'jobApplications.jobId': 1 });
resumeSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
