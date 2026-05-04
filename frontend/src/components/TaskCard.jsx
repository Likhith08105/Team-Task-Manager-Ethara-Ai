// frontend/src/components/TaskCard.jsx
import React from 'react';
import { formatDate, isOverdue, getStatusColor, getPriorityColor, getPriorityLabel } from '../utils/helpers';

const getAssigneeName = (assignee) => {
  if (!assignee) return '';
  if (typeof assignee === 'object') return assignee?.name || assignee?.email || 'Assigned member';
  return 'Assigned member';
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const status = task?.status || 'todo';
  const assignedUsers = Array.isArray(task?.assignedTo)
    ? task.assignedTo
    : task?.assignedTo
      ? [task.assignedTo]
      : [];
  const assignedNames = assignedUsers.map(getAssigneeName).filter(Boolean);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-lg">{task?.title}</h4>
          {task?.description && (
            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <button onClick={onEdit} className="text-blue-500">
              Edit
            </button>
          )}

          {onDelete && (
            <button onClick={onDelete} className="text-red-500">
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center text-sm flex-wrap">
        <div>
          <span className={`font-semibold ${getPriorityColor(task?.priority)}`}>
            {getPriorityLabel(task?.priority)}
          </span>
        </div>

        <div>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(status)}`}>
            {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        <div className={isOverdue(task?.dueDate, status) ? 'text-red-600 font-semibold' : 'text-gray-600'}>
          {formatDate(task?.dueDate)}
        </div>

        {assignedNames.length > 0 && (
          <div className="text-gray-600">
            <span className="text-xs text-gray-500">Assigned to: </span>
            {assignedNames.join(', ')}
          </div>
        )}
      </div>

      {onStatusChange && (
        <div className="mt-3 flex gap-2">
          {status !== 'todo' && (
            <button
              onClick={() => onStatusChange('todo')}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              To Do
            </button>
          )}

          {status !== 'in-progress' && (
            <button
              onClick={() => onStatusChange('in-progress')}
              className="px-3 py-1 text-xs bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
            >
              In Progress
            </button>
          )}

          {status !== 'done' && (
            <button
              onClick={() => onStatusChange('done')}
              className="px-3 py-1 text-xs bg-green-200 text-green-800 rounded hover:bg-green-300"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
