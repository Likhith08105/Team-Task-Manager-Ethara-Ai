// backend/controllers/taskController.js
const Task = require('../models/Task');
const Project = require('../models/Project');

const getEntityId = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'object') return entity._id?.toString() || entity.id?.toString() || '';
  return entity.toString();
};

const normalizeAssignedTo = (assignedTo) => {
  if (!assignedTo) return [];
  const assignedList = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
  return [...new Set(assignedList.map((user) => getEntityId(user)).filter(Boolean))];
};

const isProjectAdmin = (project, userId) => {
  const currentUserId = userId?.toString();

  return (
    getEntityId(project.createdBy) === currentUserId ||
    project.members.some(
      (member) => getEntityId(member.userId) === currentUserId && member.role === 'admin'
    )
  );
};

const isProjectMember = (project, userId) => {
  const currentUserId = userId?.toString();

  return (
    getEntityId(project.createdBy) === currentUserId ||
    project.members.some((member) => getEntityId(member.userId) === currentUserId)
  );
};

const areUsersInProject = (project, userIds) => {
  const assignedIds = normalizeAssignedTo(userIds);

  return assignedIds.every((assignedId) =>
    project.members.some((member) => getEntityId(member.userId) === assignedId)
  );
};

const isAssignedToUser = (task, userId) => {
  const currentUserId = userId?.toString();
  return normalizeAssignedTo(task.assignedTo).includes(currentUserId);
};

const populateTask = (task) =>
  task.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'assignedTo', select: 'name email' },
  ]);

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;
    const { title, description, dueDate, priority, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectAdmin(project, userId)) {
      return res.status(403).json({ message: 'Only project admins can create tasks' });
    }

    const assignedUserIds = normalizeAssignedTo(assignedTo);

    if (!areUsersInProject(project, assignedUserIds)) {
      return res.status(400).json({ message: 'Assigned users must be project members' });
    }

    const newTask = new Task({
      title,
      description,
      projectId,
      createdBy: userId,
      assignedTo: assignedUserIds,
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    await newTask.save();
    await populateTask(newTask);

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectMember(project, userId)) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    const tasks = await Task.find({ projectId })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({
      message: 'Tasks retrieved successfully',
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.userId;
    const { title, status, assignedTo, priority, description, dueDate } = req.body;

    const task = await Task.findOne({ _id: taskId, projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isAdmin = isProjectAdmin(project, userId);
    const isAssigned = isAssignedToUser(task, userId);
    const requestedFields = Object.keys(req.body);
    const isStatusOnlyUpdate = requestedFields.length === 1 && requestedFields[0] === 'status';

    if (!isAdmin && (!isAssigned || !isStatusOnlyUpdate)) {
      return res.status(403).json({
        message: 'Members can only update the status of tasks assigned to them',
      });
    }

    const assignedUserIds = normalizeAssignedTo(assignedTo);

    if (assignedTo !== undefined && !areUsersInProject(project, assignedUserIds)) {
      return res.status(400).json({ message: 'Assigned users must be project members' });
    }

    if (title !== undefined) task.title = title;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedUserIds;
    if (priority !== undefined) task.priority = priority;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();
    await populateTask(task);

    res.status(200).json({
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

const assignTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.userId;
    const { assignedTo } = req.body;

    const assignedUserIds = normalizeAssignedTo(assignedTo);

    if (assignedUserIds.length === 0) {
      return res.status(400).json({ message: 'At least one user ID to assign task is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectAdmin(project, userId)) {
      return res.status(403).json({ message: 'Only project admins can assign tasks' });
    }

    if (!areUsersInProject(project, assignedUserIds)) {
      return res.status(400).json({ message: 'Assigned users must be project members' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      { assignedTo: assignedUserIds },
      { new: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task assigned successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning task', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findOne({ _id: taskId, projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectAdmin(project, userId)) {
      return res.status(403).json({ message: 'Only project admins can delete tasks' });
    }

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

module.exports = {
  createTask,
  getProjectTasks,
  updateTask,
  assignTask,
  deleteTask,
};
