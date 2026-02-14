import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Postings</h1>
        <Link to="/jobs/create" className="px-4 py-2 bg-green-600 text-white rounded-lg">
          Create New Job
        </Link>
      </div>

      <div className="grid gap-4">
        {jobs.map(job => (
          <Link key={job._id} to={`/jobs/${job._id}`} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold">{job.title}</h3>
            <p className="text-gray-600">{job.department} • {job.location}</p>
            <p className="mt-2 text-sm text-gray-500">{job.applicantsCount} applicants</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default JobList;
