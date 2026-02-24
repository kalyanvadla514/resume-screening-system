import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');

  useEffect(() => {
    loadJobs();
  }, [filterStatus]);

  const loadJobs = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs?status=${filterStatus}`);
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    (job.department && job.department.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
        <Link 
          to="/jobs/create" 
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          ➕ Create New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search jobs by title or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="active">Active Jobs</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Job Cards */}
      {filteredJobs.length > 0 ? (
        <div className="grid gap-4">
          {filteredJobs.map(job => (
            <Link 
              key={job._id} 
              to={`/jobs/${job._id}`} 
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' :
                      job.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
                    {job.department && (
                      <span className="flex items-center">
                        <span className="mr-1">🏢</span>
                        {job.department}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center">
                        <span className="mr-1">📍</span>
                        {job.location}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className="flex items-center">
                        <span className="mr-1">💼</span>
                        {job.employmentType}
                      </span>
                    )}
                  </div>

                  {/* Skills Preview */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.requiredSkills.slice(0, 5).map((skill, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium"
                        >
                          {skill.skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {job.description}
                  </p>
                </div>

                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    {job.applicantsCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">applicants</div>
                  {job.views > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      👁️ {job.views} views
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                {job.applicationDeadline && (
                  <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
          <p className="text-gray-600 mb-6">
            {search ? 'No jobs match your search criteria' : 'No jobs posted yet'}
          </p>
          <Link 
            to="/jobs/create"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Your First Job
          </Link>
        </div>
      )}
    </div>
  );
};

export default JobList;