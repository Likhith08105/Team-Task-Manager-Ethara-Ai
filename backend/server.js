require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

connectDB();

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/projects', projectRoutes);

app.use('/api/projects', taskRoutes);

app.use('/api/dashboard', dashboardRoutes);


app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

const path = require('path');


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
