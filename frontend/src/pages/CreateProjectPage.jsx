
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
      setError('Project name is required');
      return;
    }

    setLoading(true);

    try {
      
      const response = await createProject(formData.name, formData.description);

 
      navigate(`/projects/${response.data.project._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Create New Project</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Project Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              required
            />

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter project description (optional)"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default CreateProjectPage;
