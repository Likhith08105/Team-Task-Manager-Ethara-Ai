// backend/routes/projects.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkProjectAdmin = require('../middleware/checkProjectAdmin');
const {
  createProject,
  getUserProjects,
  addMember,
  removeMember,
  getProject,
  deleteProject,
} = require('../controllers/projectController');

router.use(auth);

router.post('/', createProject);
router.get('/', getUserProjects);
router.get('/:projectId', getProject);
router.delete('/:projectId', checkProjectAdmin, deleteProject);
router.post('/:projectId/members', checkProjectAdmin, addMember);
router.delete('/:projectId/members/:memberId', checkProjectAdmin, removeMember);

module.exports = router;
