import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { Plus, Folder, Users, Calendar, MoreVertical, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', team: '', members: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes, teamsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users'),
        api.get('/teams')
      ]);
      setProjects(projectsRes.data);
      setAllUsers(usersRes.data);
      setTeams(teamsRes.data);
      if (teamsRes.data.length > 0) {
        setNewProject(prev => ({ ...prev, team: teamsRes.data[0]._id }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/projects', newProject);
      setProjects([...projects, res.data]);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', team: teams[0]?._id || '', members: [] });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const toggleMember = (userId) => {
    setNewProject(prev => {
      if (prev.members.includes(userId)) {
        return { ...prev, members: prev.members.filter(id => id !== userId) };
      } else {
        return { ...prev, members: [...prev.members, userId] };
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400">Manage your team's projects</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              const tid = window.prompt("Enter the Team ID (TID) to join:");
              if (tid) window.location.href = `/join/${tid}`;
            }}
            className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Users className="w-5 h-5 mr-2" />
            Join Team
          </button>
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={project._id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-[var(--color-primary)] transition-colors group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-800 rounded-xl text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                  <Folder className="w-6 h-6" />
                </div>
                <button className="text-gray-500 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <Link to={`/projects/${project._id}`}>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-primary)] transition-colors">{project.name}</h3>
              </Link>
              <p className="text-gray-400 text-sm mb-6 line-clamp-2">{project.description}</p>
              
              <div className="flex items-center justify-between text-sm border-t border-gray-800 pt-4">
                <div className="flex items-center text-gray-400">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{project.members?.length || 0} Members</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {projects.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed">
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No projects found</p>
              {user?.role === 'Admin' && (
                <p className="text-sm mt-2">Click "New Project" to create one.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create Project</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Team</label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    value={newProject.team}
                    onChange={(e) => setNewProject({ ...newProject, team: e.target.value, members: [] })}
                  >
                    <option value="" disabled>Select a team</option>
                    {teams.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Team Members (from selected team)</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar bg-gray-800 p-2 rounded-lg border border-gray-700">
                    {teams.find(t => t._id === newProject.team)?.members.map(memberObj => {
                      const u = typeof memberObj === 'object' ? memberObj : allUsers.find(user => user._id === memberObj);
                      if (!u || u._id === user._id) return null;
                      return (
                        <div 
                          key={u._id} 
                          onClick={() => toggleMember(u._id)}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${newProject.members.includes(u._id) ? 'bg-[var(--color-primary)]/20' : 'hover:bg-gray-700'}`}
                        >
                          <div>
                            <div className="text-sm text-white">{u.name}</div>
                            <div className="text-xs text-gray-400">{u.email}</div>
                          </div>
                          {newProject.members.includes(u._id) && <Check className="w-4 h-4 text-[var(--color-primary)]" />}
                        </div>
                      );
                    })}
                    {(!teams.find(t => t._id === newProject.team)?.members || teams.find(t => t._id === newProject.team)?.members.length <= 1) && <div className="text-xs text-gray-500 text-center py-2">No other members in this team</div>}
                  </div>
                </div>
                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
