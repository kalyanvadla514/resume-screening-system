import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResumeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    loadResume();
    loadJobs();
  }, [id]);

  const loadResume = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/resumes/${id}`);
      setResume(response.data.resume);
    } catch (error) {
      console.error('Error loading resume:', error);
      toast.error('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleMatchWithJob = async () => {
    if (!selectedJobId) {
      toast.error('Please select a job first');
      return;
    }

    setMatching(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/resumes/${id}/match/${selectedJobId}`
      );
      
      toast.success(`Match Score: ${response.data.matchScore}% - ${response.data.recommendation}`);
      await loadResume();
    } catch (error) {
      console.error('Error matching:', error);
      toast.error('Failed to match with job');
    } finally {
      setMatching(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await axios.delete(`http://localhost:5000/api/resumes/${id}`);
        toast.success('Resume deleted successfully');
        navigate('/resumes');
      } catch (error) {
        console.error('Error deleting resume:', error);
        toast.error('Failed to delete resume');
      }
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendation = (score) => {
    if (score >= 80) return '⭐ Highly Recommended';
    if (score >= 60) return '✓ Recommended';
    if (score >= 40) return '⚠️ Review Required';
    return '✗ Low Match';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume Not Found</h2>
        <Link to="/resumes" className="text-indigo-600 hover:text-indigo-800">
          ← Back to All Resumes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/resumes" className="text-indigo-600 hover:text-indigo-800 mb-2 inline-block">
            ← Back to All Resumes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Resume Details</h1>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ Delete Resume
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{resume.candidateName}</h2>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center">
                <span className="mr-2">📧</span>
                <a href={`mailto:${resume.email}`} className="text-indigo-600 hover:underline">
                  {resume.email}
                </a>
              </p>
              {resume.phone && (
                <p className="flex items-center">
                  <span className="mr-2">📱</span>
                  {resume.phone}
                </p>
              )}
              <p className="flex items-center">
                <span className="mr-2">📅</span>
                Uploaded: {new Date(resume.createdAt).toLocaleDateString()}
              </p>
              <p className="flex items-center">
                <span className="mr-2">💼</span>
                Experience: {resume.experience} years
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Skills</h3>
            {resume.skills && resume.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No skills extracted</p>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Education</h3>
            {resume.education && resume.education.length > 0 ? (
              <div className="space-y-2">
                {resume.education.map((edu, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    {edu.year && <p className="text-sm text-gray-500">{edu.year}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No education information extracted</p>
            )}
          </div>

          {resume.certifications && resume.certifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Certifications</h3>
              <div className="space-y-2">
                {resume.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Resume Text Preview</h3>
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {resume.extractedText 
                  ? resume.extractedText.substring(0, 500) + (resume.extractedText.length > 500 ? '...' : '')
                  : 'No text extracted'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">File Information</h4>
            <p className="text-sm text-gray-600">📄 {resume.fileName}</p>
            <p className="text-sm text-gray-600">📎 Type: {resume.fileType.toUpperCase()}</p>
            <p className="text-sm text-gray-600">🔗 Status: {resume.status}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Match with Job</h3>
            <div className="space-y-3">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a job...</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleMatchWithJob}
                disabled={matching || !selectedJobId}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {matching ? 'Matching...' : '🎯 Calculate Match Score'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Job Applications ({resume.jobApplications?.length || 0})
            </h3>
            
            {resume.jobApplications && resume.jobApplications.length > 0 ? (
              <div className="space-y-3">
                {resume.jobApplications
                  .sort((a, b) => b.matchScore - a.matchScore)
                  .map((app, index) => (
                    <Link
                      key={index}
                      to={`/jobs/${app.jobId._id}`}
                      className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {app.jobId.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(app.matchScore)}`}>
                          {app.matchScore}%
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {app.jobId.department}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {getRecommendation(app.matchScore)}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          app.status === 'interviewed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Applied: {new Date(app.appliedDate).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-3">No job applications yet</p>
                <p className="text-sm text-gray-400">
                  Match this resume with a job to see scores
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Skills</span>
                <span className="font-bold text-indigo-600">{resume.skills?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Experience</span>
                <span className="font-bold text-indigo-600">{resume.experience} years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Applications</span>
                <span className="font-bold text-indigo-600">{resume.jobApplications?.length || 0}</span>
              </div>
              {resume.jobApplications && resume.jobApplications.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Match Score</span>
                  <span className="font-bold text-indigo-600">
                    {Math.round(
                      resume.jobApplications.reduce((sum, app) => sum + app.matchScore, 0) / 
                      resume.jobApplications.length
                    )}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetail;