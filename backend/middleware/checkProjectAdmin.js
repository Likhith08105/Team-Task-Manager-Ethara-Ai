// backend/middleware/checkProjectAdmin.js
const Project = require('../models/Project');

const getEntityId = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'object') return entity._id?.toString() || entity.id?.toString() || '';
  return entity.toString();
};

const checkProjectAdmin = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (getEntityId(project.createdBy) === userId) {
      return next();
    }

    const isAdmin = project.members.some(
      (member) => getEntityId(member.userId) === userId && member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'You do not have admin access to this project' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin access', error: error.message });
  }
};

module.exports = checkProjectAdmin;
