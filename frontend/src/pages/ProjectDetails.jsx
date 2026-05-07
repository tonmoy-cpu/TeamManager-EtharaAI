import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import { Plus, X, AlignLeft, Calendar, Flag, Trash2, ArrowLeft } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocketStore(state => state.socket);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '', assignedTo: '' });

  useEffect(() => {
    fetchProjectAndTasks();

    if (socket) {
      socket.emit('join_project', id);

      const handleTaskCreated = (newTask) => setTasks(prev => [...prev, newTask]);
      const handleTaskUpdated = (updatedTask) => setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
      const handleTaskDeleted = (taskId) => setTasks(prev => prev.filter(t => t._id !== taskId));

      socket.on('task_created', handleTaskCreated);
      socket.on('task_updated', handleTaskUpdated);
      socket.on('task_deleted', handleTaskDeleted);

      return () => {
        socket.off('task_created', handleTaskCreated);
        socket.off('task_updated', handleTaskUpdated);
        socket.off('task_deleted', handleTaskDeleted);
      };
    }
  }, [id, socket]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newTask, project: id };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;

      const res = await api.post('/tasks', payload);
      // Let socket handle the state update
      setIsModalOpen(false);
      setNewTask({ title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '', assignedTo: '' });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      // state updated via socket
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleAssigneeChange = async (taskId, newAssignee) => {
    try {
      await api.put(`/tasks/${taskId}`, { assignedTo: newAssignee || null });
      // state updated via socket
    } catch (error) {
      console.error("Failed to update assignee:", error);
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/tasks/${taskId}`);
      // state updated via socket
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      window.location.href = `/teams/${project.team._id}`;
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'To Do': return 'bg-gray-800 text-gray-300 border-gray-700';
      case 'In Progress': return 'bg-blue-900/30 text-blue-300 border-blue-500/50';
      case 'Done': return 'bg-emerald-900/30 text-emerald-300 border-emerald-500/50';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-400 bg-red-400/10';
      case 'Medium': return 'text-orange-400 bg-orange-400/10';
      case 'Low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div></div>;

  const isAdminOrOwner = user?.role === 'Admin' || String(project?.team?.owner?._id || project?.team?.owner) === String(user?._id);
  const isAdmin = user?.role === 'Admin';
  
  const canEditTask = (task) => isAdmin || String(task.createdBy) === String(user?._id);
  
  // Available assignees = members of the team
  const availableAssignees = [
    { _id: typeof project.team.owner === 'object' ? project.team.owner._id : project.team.owner, name: "Team Admin" },
    ...project.members
  ];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 flex-shrink-0 gap-4">
        <div>
          <Link to={`/teams/${project?.team?._id}`} className="flex items-center text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] text-sm mb-2 font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Team
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{project?.name}</h1>
          </div>
          <p className="text-gray-400">{project?.description}</p>
        </div>
        
        <div className="flex space-x-2">
          {isAdmin && (
            <button onClick={handleDeleteProject} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-500/20">
               Delete Board
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">
            <Plus className="w-5 h-5 mr-2" /> Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {['To Do', 'In Progress', 'Done'].map(status => {
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="w-[320px] flex flex-col bg-gray-900/50 rounded-2xl p-4 border border-gray-800/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">{status}</h3>
                  <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">{columnTasks.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {columnTasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
                    return (
                      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={task._id} className={`bg-gray-800 rounded-xl p-4 border ${isOverdue ? 'border-red-500/50' : 'border-gray-700 hover:border-gray-600'} transition-colors group relative flex flex-col`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center ${getPriorityColor(task.priority)}`}>
                            <Flag className="w-3 h-3 mr-1" /> {task.priority}
                          </span>
                          {canEditTask(task) && (
                            <button onClick={(e) => handleDeleteTask(task._id, e)} className="text-gray-500 hover:text-red-500 bg-gray-800 rounded p-1 border border-gray-700 hover:border-red-500 transition-all z-20" title="Delete Task">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <h4 className="text-white font-medium mb-2 pr-2">{task.title}</h4>
                        {task.description && (
                          <div className="flex items-start text-gray-400 text-xs mb-3">
                            <AlignLeft className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{task.description}</span>
                          </div>
                        )}
                        
                        <div className="mt-4 pt-3 border-t border-gray-700/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className={`flex items-center text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
                              <Calendar className="w-3 h-3 mr-1" />
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                            </div>
                            <select disabled={!canEditTask(task)} className={`text-xs px-2 py-1 rounded border outline-none cursor-pointer appearance-none ${getStatusColor(task.status)} disabled:opacity-50`} value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}>
                              <option value="To Do">To Do</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                          
                          {/* Re-assign Dropdown directly on card */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Assignee:</span>
                            <select 
                              disabled={!canEditTask(task)}
                              className="text-xs px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 outline-none cursor-pointer max-w-[140px] truncate disabled:opacity-50"
                              value={task.assignedTo?._id || ''}
                              onChange={(e) => handleAssigneeChange(task._id, e.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {availableAssignees.map(member => (
                                <option key={member._id} value={member._id}>{member.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create Task</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Task Title</label>
                  <input type="text" required className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea rows="3" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none resize-none focus:ring-2 focus:ring-[var(--color-primary)]" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                    <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                    <input type="date" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Assign To</label>
                  <select className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none" value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {availableAssignees.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 flex space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">Create</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetails;
