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


router.use(auth);

router.post('/:projectId/tasks', createTask);

router.get('/:projectId/tasks', getProjectTasks);

router.put('/:projectId/tasks/:taskId', updateTask);

router.put('/:projectId/tasks/:taskId/assign', assignTask);

router.delete('/:projectId/tasks/:taskId', deleteTask);

module.exports = router;
