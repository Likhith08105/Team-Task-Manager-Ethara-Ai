import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authLogin } from '../services/api';
import { saveToken, saveUser } from '../utils/helpers';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call login API
      const response = await authLogin(formData.email, formData.password);

      // Save token and user info
      saveToken(response.data.token);
      saveUser(response.data.user);

      
      navigate('/dashboard');
    } catch (err) {
      // Show error message
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Team Task Manager</h1>
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-6">Sign In</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
