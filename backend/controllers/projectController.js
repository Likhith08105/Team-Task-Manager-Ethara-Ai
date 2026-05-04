const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

const getEntityId = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'object') return entity._id?.toString() || entity.id?.toString() || '';
  return entity.toString();
};

const populateProject = (project) =>
  project.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'members.userId', select: 'name email' },
  ]);

const isProjectMember = (project, userId) => {
  const currentUserId = userId?.toString();

  return (
    getEntityId(project.createdBy) === currentUserId ||
    project.members.some((member) => getEntityId(member.userId) === currentUserId)
  );
};

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const newProject = new Project({
      name,
      description,
      createdBy: userId,
      members: [{ userId, role: 'admin' }],
    });

    await newProject.save();
    await populateProject(newProject);

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

const getUserProjects = async (req, res) => {
  try {
    const userId = req.userId;

    const projects = await Project.find({
      $or: [{ createdBy: userId }, { 'members.userId': userId }],
    })
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    res.status(200).json({
      message: 'Projects retrieved successfully',
      projects,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const { projectId } = req.params;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isAlreadyMember = project.members.some(
      (member) => getEntityId(member.userId) === user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    project.members.push({ userId: user._id, role: 'member' });
    await project.save();
    await populateProject(project);

    res.status(200).json({ message: 'Member added successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Error adding member', error: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const memberToRemove = project.members.find(
      (member) => getEntityId(member.userId) === memberId || getEntityId(member) === memberId
    );

    if (!memberToRemove) {
      return res.status(404).json({ message: 'Member not found in project' });
    }

    const memberUserId = getEntityId(memberToRemove.userId);

    if (getEntityId(project.createdBy) === memberUserId) {
      return res.status(400).json({ message: 'Cannot remove project creator' });
    }

    project.members = project.members.filter(
      (member) => getEntityId(member.userId) !== memberId && getEntityId(member) !== memberId
    );

    await project.save();
    await populateProject(project);

    res.status(200).json({
      message: 'Member removed successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectMember(project, userId)) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    res.status(200).json({
      message: 'Project retrieved successfully',
      project,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    await Task.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

module.exports = {
  createProject,
  getUserProjects,
  addMember,
  removeMember,
  getProject,
  deleteProject,
};
