import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { CheckSquare, Calendar, Flag, LayoutGrid, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (error) {
        console.error("Failed to fetch my tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTasks();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'To Do': return 'bg-gray-800 text-gray-300';
      case 'In Progress': return 'bg-blue-500/10 text-blue-400';
      case 'Done': return 'bg-emerald-500/10 text-emerald-400';
      default: return 'bg-gray-800 text-gray-300';
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <CheckSquare className="w-8 h-8 mr-3 text-[var(--color-primary)]" />
          My Tasks
        </h1>
        <p className="text-gray-400">View all tasks assigned to you across all your teams and projects.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="py-20 text-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">You have no tasks assigned to you right now.</p>
          <p className="text-sm mt-2">Time to relax or ask your Team Admin for some work!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map((task, i) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={task._id}
                className={`bg-gray-900 border ${isOverdue ? 'border-red-500/50' : 'border-gray-800'} rounded-xl p-5 hover:border-[var(--color-primary)] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center ${getPriorityColor(task.priority)}`}>
                      <Flag className="w-3 h-3 mr-1" /> {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{task.title}</h3>
                  {task.description && <p className="text-gray-400 text-sm line-clamp-1 mb-3">{task.description}</p>}
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {task.project?.team && (
                      <div className="flex items-center bg-gray-800 px-2 py-1 rounded">
                        <LayoutGrid className="w-3 h-3 mr-1" />
                        {task.project.team.name} / {task.project.name}
                      </div>
                    )}
                    <div className={`flex items-center ${isOverdue ? 'text-red-400 font-medium' : ''}`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Link to={`/projects/${task.project?._id}`} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-[var(--color-primary)] transition-colors flex items-center text-sm font-medium">
                    Go to Board
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
