const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  department: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
    default: 'full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid'
  },
  requiredSkills: [{
    skill: {
      type: String,
      required: true,
      trim: true
    },
    importance: {
      type: String,
      enum: ['required', 'preferred', 'nice-to-have'],
      default: 'required'
    },
    weight: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  }],
  minExperience: {
    type: Number,
    default: 0
  },
  maxExperience: {
    type: Number
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  education: [{
    type: String
  }],
  certifications: [{
    type: String
  }],
  responsibilities: [{
    type: String
  }],
  benefits: [{
    type: String
  }],
  applicationDeadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'active'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicantsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for searching
jobSchema.index({ title: 'text', description: 'text', 'requiredSkills.skill': 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
