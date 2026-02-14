import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ResumeList = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resumes');
      setResumes(response.data.resumes || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResumes = resumes.filter(resume =>
    resume.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    resume.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Resumes</h1>
        <Link to="/resumes/upload" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Upload New
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search resumes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 border rounded-lg"
      />

      <div className="grid gap-4">
        {filteredResumes.map(resume => (
          <Link
            key={resume._id}
            to={`/resumes/${resume._id}`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold">{resume.candidateName}</h3>
            <p className="text-gray-600">{resume.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {resume.skills.slice(0, 5).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResumeList;
