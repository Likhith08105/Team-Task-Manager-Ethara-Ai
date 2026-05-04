const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const projects = await Project.find({
      $or: [{ createdBy: userObjectId }, { 'members.userId': userObjectId }],
    }).select('_id');

    const projectIds = projects.map((project) => project._id);
    const taskMatch = { projectId: { $in: projectIds } };

    const totalTasks = await Task.countDocuments(taskMatch);

    const tasksByStatus = await Task.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const overdueTasks = await Task.find({
      ...taskMatch,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' },
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name');

    const tasksByPriority = await Task.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {};
    tasksByStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    const priorityMap = {};
    tasksByPriority.forEach((item) => {
      priorityMap[item._id] = item.count;
    });

    res.status(200).json({
      message: 'Dashboard stats retrieved successfully',
      stats: {
        totalTasks,
        tasksByStatus: {
          todo: statusMap.todo || 0,
          inProgress: statusMap['in-progress'] || 0,
          done: statusMap.done || 0,
        },
        tasksByPriority: {
          low: priorityMap.low || 0,
          medium: priorityMap.medium || 0,
          high: priorityMap.high || 0,
        },
        overdueTasks: {
          count: overdueTasks.length,
          tasks: overdueTasks,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

module.exports = { getDashboardStats };
