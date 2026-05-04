// This file defines the Project model for managing team projects
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    // Project name
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Project description (optional)
    description: {
      type: String,
      trim: true,
    },
    // User who created the project (they become the admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Array of users who are members of this project
    // Each member object contains userId and role
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        // Role can be 'admin' or 'member'
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
      },
    ],
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
