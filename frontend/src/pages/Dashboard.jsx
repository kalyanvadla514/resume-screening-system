import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics/dashboard');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Resumes',
      value: analytics?.overview?.totalResumes || 0,
      icon: '📄',
      color: 'bg-blue-500'
    },
    {
      name: 'Active Jobs',
      value: analytics?.overview?.totalJobs || 0,
      icon: '💼',
      color: 'bg-green-500'
    },
    {
      name: 'Applications',
      value: analytics?.overview?.totalApplications || 0,
      icon: '📨',
      color: 'bg-purple-500'
    },
    {
      name: 'Avg Match Score',
      value: `${analytics?.overview?.avgMatchScore || 0}%`,
      icon: '⭐',
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <Link
            to="/resumes/upload"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            📤 Upload Resume
          </Link>
          <Link
            to="/jobs/create"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ➕ Create Job
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-full p-4 text-3xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Skills in Database</h2>
          {analytics?.topSkills && analytics.topSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topSkills.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No skill data available</p>
          )}
        </div>

        {/* Top Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Jobs by Applications</h2>
          <div className="space-y-3">
            {analytics?.topJobs && analytics.topJobs.length > 0 ? (
              analytics.topJobs.map((job, index) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{index + 1}.</span>
                    <div>
                      <p className="font-semibold text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.department}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {job.applicantsCount} applicants
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No job data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Resumes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Resumes</h2>
          <div className="space-y-3">
            {analytics?.recentActivity?.resumes && analytics.recentActivity.resumes.length > 0 ? (
              analytics.recentActivity.resumes.map((resume) => (
                <Link
                  key={resume._id}
                  to={`/resumes/${resume._id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{resume.candidateName}</p>
                    <p className="text-sm text-gray-600">{resume.email}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent resumes</p>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Jobs</h2>
          <div className="space-y-3">
            {analytics?.recentActivity?.jobs && analytics.recentActivity.jobs.length > 0 ? (
              analytics.recentActivity.jobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.department}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent jobs</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
