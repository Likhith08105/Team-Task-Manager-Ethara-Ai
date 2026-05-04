// This file defines all task-related routes
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTask,
  getProjectTasks,
  updateTask,
  assignTask,
  deleteTask,
} = require('../controllers/taskController');

// All task routes require authentication
router.use(auth);

// CREATE task - POST /api/projects/:projectId/tasks
router.post('/:projectId/tasks', createTask);

// GET all tasks in a project - GET /api/projects/:projectId/tasks
router.get('/:projectId/tasks', getProjectTasks);

// UPDATE task - PUT /api/projects/:projectId/tasks/:taskId
router.put('/:projectId/tasks/:taskId', updateTask);

// ASSIGN task - PUT /api/projects/:projectId/tasks/:taskId/assign
router.put('/:projectId/tasks/:taskId/assign', assignTask);

// DELETE task - DELETE /api/projects/:projectId/tasks/:taskId
router.delete('/:projectId/tasks/:taskId', deleteTask);

module.exports = router;
