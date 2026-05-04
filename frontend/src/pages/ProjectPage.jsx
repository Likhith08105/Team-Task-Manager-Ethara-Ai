
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProject,
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
} from '../services/api';
import { getUser } from '../utils/helpers';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';

const getEntityId = (entity) => {
  if (!entity) return '';
  if (typeof entity === 'object') return entity?._id?.toString() || entity?.id?.toString() || '';
  return entity.toString();
};

const normalizeIds = (value) => {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.map((item) => getEntityId(item)).filter(Boolean))];
};

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: [],
  });

  const [memberForm, setMemberForm] = useState({ email: '' });

  const projectMembers = Array.isArray(project?.members) ? project.members : [];
  const createdById = getEntityId(project?.createdBy);
  const currentUserId = getEntityId(user);

  const getMemberUser = (member) => member?.userId || member?.user || null;
  const getMemberUserId = (member) => getEntityId(getMemberUser(member));
  const getMemberName = (member) => {
    const memberUser = getMemberUser(member);
    return memberUser?.name || memberUser?.email || 'Member';
  };

  const getAssignedUsers = (assignedTo) => {
    if (!assignedTo) return [];
    const assignedList = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

    return assignedList.map((assignee) => {
      if (assignee && typeof assignee === 'object') return assignee;

      const assignedId = getEntityId(assignee);
      const member = projectMembers.find((projectMember) => getMemberUserId(projectMember) === assignedId);
      const memberUser = getMemberUser(member);

      return memberUser && typeof memberUser === 'object'
        ? memberUser
        : { _id: assignedId, name: 'Assigned member' };
    });
  };

  const isAdmin =
    Boolean(project && currentUserId) &&
    (createdById === currentUserId ||
      projectMembers.some((member) => {
        const memberUserId = getMemberUserId(member);
        return memberUserId === currentUserId && member?.role === 'admin';
      }));

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    const refreshPageData = () => {
      fetchProject();
      fetchTasks();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshPageData();
    };

    window.addEventListener('focus', refreshPageData);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshPageData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await getProject(projectId);
      setProject(response.data?.project || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getProjectTasks(projectId);
      setTasks(Array.isArray(response.data?.tasks) ? response.data.tasks : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: [] });
  };

  const handleTaskChange = (e) => {
    const { name, value, selectedOptions } = e.target;

    if (name === 'assignedTo') {
      setTaskForm((prev) => ({
        ...prev,
        assignedTo: Array.from(selectedOptions).map((option) => option.value),
      }));
      return;
    }

    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignedToggle = (memberUserId) => {
    setTaskForm((prev) => {
      const assignedIds = normalizeIds(prev.assignedTo);
      const isSelected = assignedIds.includes(memberUserId);

      return {
        ...prev,
        assignedTo: isSelected
          ? assignedIds.filter((assignedId) => assignedId !== memberUserId)
          : [...assignedIds, memberUserId],
      };
    });
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();

    if (!taskForm.title) {
      alert('Task title is required');
      return;
    }

    try {
      const taskData = {
        ...taskForm,
        assignedTo: normalizeIds(taskForm.assignedTo),
      };

      if (editingTask) {
        await updateTask(projectId, editingTask._id, taskData);
      } else {
        await createTask(
          projectId,
          taskData.title,
          taskData.description,
          taskData.dueDate,
          taskData.priority,
          taskData.assignedTo
        );
      }

      await Promise.all([fetchProject(), fetchTasks()]);
      setShowTaskModal(false);
      setEditingTask(null);
      resetTaskForm();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(projectId, taskId);
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(projectId);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await updateTask(projectId, taskId, { status: newStatus });
      const updatedTask = response.data?.task;

      if (updatedTask) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task?._id === updatedTask._id ? updatedTask : task))
        );
      }

      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task?.priority || 'medium',
      assignedTo: normalizeIds(task?.assignedTo),
    });
    setShowTaskModal(true);
  };

  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setMemberForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    const email = memberForm.email.trim();

    if (!email) {
      alert('Email is required');
      return;
    }

    try {
      const response = await addMemberToProject(projectId, email);
      setProject(response.data?.project || project);
      setShowMemberModal(false);
      setMemberForm({ email: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await removeMemberFromProject(projectId, memberId);
      setProject(response.data?.project || project);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Button onClick={() => navigate('/dashboard')} variant="secondary">
          Back to Dashboard
        </Button>
        <p className="text-red-600 mt-4">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:text-blue-800 mb-2">
            Back to Dashboard
          </button>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{project?.name}</h1>
              {project?.description && <p className="text-gray-600 mt-2">{project.description}</p>}
            </div>

            {isAdmin && (
              <Button onClick={handleDeleteProject} variant="danger">
                Delete Project
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Tasks</h2>
              {isAdmin && (
                <Button
                  onClick={() => {
                    setEditingTask(null);
                    resetTaskForm();
                    setShowTaskModal(true);
                  }}
                  variant="primary"
                >
                  + New Task
                </Button>
              )}
            </div>

            {tasks.length === 0 ? (
              <Card>
                <p className="text-center text-gray-600">No tasks yet. Create one to get started!</p>
              </Card>
            ) : (
              <div>
                {tasks.map((task) => {
                  const taskId = task?._id;
                  const assignedIds = normalizeIds(task?.assignedTo);
                  const canUpdate = isAdmin || assignedIds.includes(currentUserId);
                  const taskForCard = {
                    ...task,
                    title: task?.title || '',
                    status: task?.status || 'todo',
                    priority: task?.priority || 'medium',
                    assignedTo: getAssignedUsers(task?.assignedTo),
                  };

                  return (
                    <TaskCard
                      key={taskId}
                      task={taskForCard}
                      onEdit={isAdmin ? () => handleEditTask(task) : null}
                      onDelete={isAdmin ? () => handleDeleteTask(taskId) : null}
                      onStatusChange={canUpdate ? (status) => handleStatusChange(taskId, status) : null}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <Card title="Project Members">
              <div className="space-y-3">
                {projectMembers.length === 0 ? (
                  <p className="text-gray-600 text-sm">No members yet.</p>
                ) : (
                  projectMembers.map((member) => {
                    const memberUserId = getMemberUserId(member);
                    const memberName = getMemberName(member);

                    return (
                      <div key={memberUserId || member?._id || memberName} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{memberName}</p>
                          {member?.role && <p className="text-xs text-gray-500 capitalize">{member.role}</p>}
                        </div>

                        {isAdmin && memberUserId && memberUserId !== createdById && (
                          <button
                            onClick={() => handleRemoveMember(memberUserId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {isAdmin && (
                <Button onClick={() => setShowMemberModal(true)} variant="secondary" className="w-full mt-4">
                  + Add Member
                </Button>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingTask ? 'Edit Task' : 'Create Task'}>
        <form onSubmit={handleSaveTask}>
          <Input label="Task Title" name="title" value={taskForm.title} onChange={handleTaskChange} required />

          <div>
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={taskForm.description}
              onChange={handleTaskChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <Input label="Due Date" name="dueDate" type="date" value={taskForm.dueDate} onChange={handleTaskChange} />

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Priority</label>
            <select name="priority" value={taskForm.priority} onChange={handleTaskChange} className="input-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Assign To</label>
            <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
              {projectMembers.length === 0 ? (
                <p className="text-sm text-gray-500">No members available</p>
              ) : (
                projectMembers.map((member) => {
                  const memberUserId = getMemberUserId(member);
                  const memberName = getMemberName(member);

                  if (!memberUserId) return null;

                  return (
                    <label key={memberUserId} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={taskForm.assignedTo.includes(memberUserId)}
                        onChange={() => handleAssignedToggle(memberUserId)}
                      />
                      <span>{memberName}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowTaskModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember}>
          <Input
            label="Member Email"
            name="email"
            value={memberForm.email}
            onChange={handleMemberChange}
            placeholder="Enter member email"
            required
          />

          <div className="flex gap-2">
            <Button type="submit" variant="primary">
              Add Member
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowMemberModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectPage;
