import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    loadJob();
    loadCandidates();
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(response.data.job);
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}/candidates`);
      setCandidates(response.data.candidates || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const handleMatchAll = async () => {
    setMatching(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/jobs/${id}/match-all`);
      toast.success(`Matched ${response.data.matched} candidates!`);
      await loadCandidates();
    } catch (error) {
      console.error('Error matching:', error);
      toast.error('Failed to match candidates');
    } finally {
      setMatching(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!job) {
    return <div className="text-center py-12"><h2 className="text-2xl font-bold">Job Not Found</h2><Link to="/jobs" className="text-indigo-600">← Back to Jobs</Link></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/jobs" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">← Back to Jobs</Link>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-4">
          {job.department && <span>🏢 {job.department}</span>}
          {job.location && <span>📍 {job.location}</span>}
          <span>💼 {job.employmentType}</span>
          <span>⭐ {job.experienceLevel}</span>
        </div>
        
        <div className="prose max-w-none mb-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-700">{job.description}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills?.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {skill.skill} (Weight: {skill.weight}/10)
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleMatchAll}
          disabled={matching}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {matching ? 'Matching...' : '🎯 Match All Resumes'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Ranked Candidates ({candidates.length})</h2>
        {candidates.length > 0 ? (
          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <Link key={candidate.resumeId} to={`/resumes/${candidate.resumeId}`} className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                      <h3 className="font-semibold text-lg">{candidate.candidateName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(candidate.matchScore)}`}>
                        {candidate.matchScore}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{candidate.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {candidate.skills?.slice(0, 5).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{candidate.experience} years exp</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12"><p className="text-gray-500">No candidates matched yet</p><p className="text-sm text-gray-400 mt-2">Click "Match All Resumes" to find candidates</p></div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;