import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { Plus, Users, Calendar, MoreVertical, X, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Teams = () => {
  const user = useAuthStore((state) => state.user);
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '', members: [] });
  const [joinTid, setJoinTid] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        api.get('/teams'),
        api.get('/users')
      ]);
      setTeams(teamsRes.data);
      setAllUsers(usersRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/teams', newTeam);
      setTeams([...teams, res.data]);
      setIsModalOpen(false);
      setNewTeam({ name: '', description: '', members: [] });
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const toggleMember = (userId) => {
    setNewTeam(prev => {
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
          <h1 className="text-3xl font-bold text-white mb-2">Teams</h1>
          <p className="text-gray-400">Manage your workspaces and teams</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsJoinModalOpen(true)}
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
              New Team
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
          {teams.map((team, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={team._id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-[var(--color-primary)] transition-colors group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-800 rounded-xl text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded font-mono">TID: {team.tid}</span>
              </div>
              <Link to={`/teams/${team._id}`}>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-primary)] transition-colors flex items-center">
                  {team.name}
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
              </Link>
              <p className="text-gray-400 text-sm mb-6 line-clamp-2">{team.description}</p>
              
              <div className="flex items-center justify-between text-sm border-t border-gray-800 pt-4">
                <div className="flex items-center text-gray-400">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{team.members?.length + 1 || 1} Members</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {teams.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No teams found</p>
              {user?.role === 'Admin' && (
                <p className="text-sm mt-2">Click "New Team" to create your workspace.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Team Modal */}
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
                <h2 className="text-2xl font-bold text-white">Create Team</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Team Members (Optional)</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar bg-gray-800 p-2 rounded-lg border border-gray-700">
                    {allUsers.filter(u => u._id !== user._id).map(u => (
                      <div 
                        key={u._id} 
                        onClick={() => toggleMember(u._id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${newTeam.members.includes(u._id) ? 'bg-[var(--color-primary)]/20' : 'hover:bg-gray-700'}`}
                      >
                        <div>
                          <div className="text-sm text-white">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                        {newTeam.members.includes(u._id) && <Check className="w-4 h-4 text-[var(--color-primary)]" />}
                      </div>
                    ))}
                    {allUsers.length <= 1 && <div className="text-xs text-gray-500 text-center py-2">No other users found</div>}
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
      {/* Join Team Modal */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Join a Team</h2>
                <button onClick={() => setIsJoinModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Enter Team ID (TID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T-ABCDEF"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none uppercase font-mono"
                    value={joinTid}
                    onChange={(e) => setJoinTid(e.target.value)}
                  />
                </div>
                <div className="pt-4 flex space-x-3">
                  <button onClick={() => setIsJoinModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={() => { if(joinTid) window.location.href = `/join/${joinTid}`; }}
                    disabled={!joinTid}
                    className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                  >
                    Join
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Teams;
