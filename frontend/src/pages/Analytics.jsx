import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
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

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="text-4xl mb-2">📄</div>
          <div className="text-3xl font-bold">{analytics?.overview?.totalResumes || 0}</div>
          <div className="text-blue-100">Total Resumes</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="text-4xl mb-2">💼</div>
          <div className="text-3xl font-bold">{analytics?.overview?.totalJobs || 0}</div>
          <div className="text-green-100">Active Jobs</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="text-4xl mb-2">📨</div>
          <div className="text-3xl font-bold">{analytics?.overview?.totalApplications || 0}</div>
          <div className="text-purple-100">Applications</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-3xl font-bold">{analytics?.overview?.avgMatchScore || 0}%</div>
          <div className="text-yellow-100">Avg Match Score</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Skills in Database</h2>
          {analytics?.topSkills && analytics.topSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topSkills.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" name="Candidates with Skill" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No skill data available</p>
          )}
        </div>

        {/* Resume Status Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Application Status Distribution</h2>
          {analytics?.resumesByStatus && analytics.resumesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.resumesByStatus}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.resumesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No status data available</p>
          )}
        </div>
      </div>

      {/* Top Jobs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Jobs by Applications</h2>
        {analytics?.topJobs && analytics.topJobs.length > 0 ? (
          <div className="space-y-3">
            {analytics.topJobs.map((job, index) => (
              <div key={job._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.department}</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                  {job.applicantsCount} applicants
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No job data available</p>
        )}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Hiring Efficiency</h3>
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {analytics?.overview?.totalApplications && analytics?.overview?.totalResumes 
              ? Math.round((analytics.overview.totalApplications / analytics.overview.totalResumes) * 10) / 10
              : 0}
          </div>
          <p className="text-sm text-gray-600">Applications per resume</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Match Quality</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {analytics?.overview?.avgMatchScore || 0}%
          </div>
          <p className="text-sm text-gray-600">Average match score</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">💼 Active Pipeline</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {analytics?.overview?.totalJobs || 0}
          </div>
          <p className="text-sm text-gray-600">Open positions</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;