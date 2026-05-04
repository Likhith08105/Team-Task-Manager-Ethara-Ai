// Dashboard page - shows task overview and statistics
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getUserProjects } from '../services/api';
import { removeToken, getUser } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';

const DashboardPage = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = useCallback(async () => {
    const response = await getDashboardStats();
    setStats(response.data?.stats || null);
  }, []);

  const fetchProjects = useCallback(async () => {
    const response = await getUserProjects();
    setProjects(Array.isArray(response.data?.projects) ? response.data.projects : []);
  }, []);

  const fetchDashboard = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        setError('');

        await Promise.all([fetchDashboardStats(), fetchProjects()]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [fetchDashboardStats, fetchProjects]
  );

  // Fetch dashboard stats and projects on page load
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Refresh stale data when returning to the dashboard after project/task actions
  useEffect(() => {
    const refreshDashboard = () => {
      fetchDashboard(false);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) refreshDashboard();
    };

    window.addEventListener('focus', refreshDashboard);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshDashboard);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboard]);

  // Handle logout
  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  // Handle navigate to project
  const handleOpenProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleCreateProject = async () => {
    await Promise.all([fetchProjects(), fetchDashboardStats()]);
    navigate('/projects/create');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.name}!</p>
          </div>
          <Button onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats?.totalTasks || 0}</p>
              <p className="text-gray-600 text-sm">Total Tasks</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats?.tasksByStatus?.todo || 0}</p>
              <p className="text-gray-600 text-sm">To Do</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats?.tasksByStatus?.inProgress || 0}</p>
              <p className="text-gray-600 text-sm">In Progress</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats?.tasksByStatus?.done || 0}</p>
              <p className="text-gray-600 text-sm">Done</p>
            </div>
          </Card>
        </div>

        {/* Overdue Tasks */}
        {stats?.overdueTasks?.count > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              {stats.overdueTasks.count} Overdue Task{stats.overdueTasks.count !== 1 ? 's' : ''}
            </h2>
            <div className="space-y-2">
              {stats.overdueTasks.tasks.map((task) => (
                <div key={task._id} className="bg-white p-3 rounded border border-red-200">
                  <p className="font-semibold text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-600">
                    {task.projectId?.name} - Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Projects Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Your Projects</h2>
            <Button onClick={handleCreateProject} variant="primary">
              + New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <Card>
              <p className="text-center text-gray-600">No projects yet. Create one to get started!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card key={project._id} className="cursor-pointer hover:shadow-lg transition">
                  <div onClick={() => handleOpenProject(project._id)}>
                    <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                    {project.description && (
                      <p className="text-gray-600 text-sm mt-2">{project.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-3">
                      {(project.members || []).length} member{(project.members || []).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
