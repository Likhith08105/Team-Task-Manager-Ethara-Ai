// This is the main server file that initializes Express and sets up all routes
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import all route files
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// MIDDLEWARE

// Enable CORS (allows frontend to make requests from different domain)
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// ROUTES

// Authentication routes - no prefix
app.use('/api/auth', authRoutes);

// Project routes - /api/projects
app.use('/api/projects', projectRoutes);

// Task routes - /api/projects
app.use('/api/projects', taskRoutes);

// Dashboard routes - /api/dashboard
app.use('/api/dashboard', dashboardRoutes);

// Health check route (useful for deployment monitoring)
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

const path = require('path');


// Serve frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route → send React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});
// ERROR HANDLING MIDDLEWARE

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// START SERVER

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
