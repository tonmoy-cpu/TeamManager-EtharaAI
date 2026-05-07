import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { CheckCircle, Clock, AlertCircle, ListTodo, AlertTriangle, User, ArrowRight, FolderPlus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/tasks/dashboard');
        const tasks = res.data;
        
        let todo = 0, inProgress = 0, done = 0, overdue = 0;
        const now = new Date();
        
        tasks.forEach(t => {
          if (t.status === 'To Do') todo++;
          else if (t.status === 'In Progress') inProgress++;
          else if (t.status === 'Done') done++;
          
          if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done') {
            overdue++;
          }
        });

        setStats({ total: tasks.length, todo, inProgress, done, overdue });
        setRecentTasks(tasks.slice(0, 5)); // show up to 5 recent/upcoming tasks
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'from-blue-500 to-cyan-400' },
    { title: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'from-red-500 to-rose-400' },
    { title: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: 'from-[var(--color-primary)] to-[var(--color-primary-hover)]' },
    { title: 'Completed', value: stats.done, icon: CheckCircle, color: 'from-emerald-500 to-teal-400' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </motion.h1>
        <p className="text-gray-400">Here's an overview of your workspace.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group"
                >
                  <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full mix-blend-multiply filter blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">{stat.title}</h3>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">{stat.value}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Quick Start Guide if Empty */}
          {stats.total === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-gray-900 to-gray-800 border border-[var(--color-primary)]/30 rounded-3xl p-8 relative overflow-hidden mt-8 shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30 mb-4 uppercase tracking-wider">
                  Quick Start Guide
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Your dashboard is looking a little empty!</h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  The dashboard live-tracks tasks assigned to your projects. To see this page come alive with statistics, you need to either create a project and assign tasks, or join an existing team!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/teams" className="group flex items-center p-4 bg-gray-900/80 border border-gray-700 rounded-2xl hover:border-[var(--color-primary)] transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <FolderPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1">1. Create a Team</h3>
                      <p className="text-sm text-gray-400">Set up your first team workspace</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto text-gray-600 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                  </Link>
                  
                  <Link to="/teams" className="group flex items-center p-4 bg-gray-900/80 border border-gray-700 rounded-2xl hover:border-[var(--color-primary)] transition-all">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <ListTodo className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1">2. Assign Tasks</h3>
                      <p className="text-sm text-gray-400">Open your project and add To-Dos</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto text-gray-600 group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Standard Dashboard Content */}
          {stats.total > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
            >
              <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Recent & Upcoming Tasks</h3>
                <div className="space-y-4">
                  {recentTasks.length > 0 ? recentTasks.map(task => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
                    return (
                      <Link to={`/projects/${task.project._id}`} key={task._id} className="block">
                        <div className={`p-4 rounded-xl border ${isOverdue ? 'border-red-500/50 bg-red-500/5' : 'border-gray-800 bg-gray-800/50'} hover:border-[var(--color-primary)] transition-colors flex items-center justify-between`}>
                          <div>
                            <h4 className="text-white font-medium mb-1">{task.title}</h4>
                            <div className="flex items-center text-sm text-gray-400 space-x-3">
                              <span className="bg-gray-700 px-2 py-0.5 rounded text-xs">{task.project?.name || 'Unknown'}</span>
                              <span className={`flex items-center ${isOverdue ? 'text-red-400' : ''}`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                              </span>
                            </div>
                          </div>
                          <div>
                             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                task.status === 'In Progress' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                              }`}>
                                {task.status}
                              </span>
                          </div>
                        </div>
                      </Link>
                    )
                  }) : (
                    <p className="text-gray-500 text-center py-10">No tasks found.</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-2xl p-6 h-fit text-white">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/teams" className="flex items-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                    <div className="bg-white/20 p-2 rounded-lg mr-3"><FolderPlus className="w-5 h-5" /></div>
                    <div>
                      <div className="font-medium">Team Workspace</div>
                      <div className="text-white/70 text-sm">Create teams & assign tasks</div>
                    </div>
                  </Link>
                  <Link to="/settings" className="flex items-center p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                    <div className="bg-white/20 p-2 rounded-lg mr-3"><User className="w-5 h-5" /></div>
                    <div>
                      <div className="font-medium">Update Profile</div>
                      <div className="text-white/70 text-sm">Customize your experience</div>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
