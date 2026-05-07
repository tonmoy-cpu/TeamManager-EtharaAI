import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { useSocketStore } from '../store/useSocketStore';
import { Plus, X, Trash2, Users, MessageSquare, LayoutGrid, Copy, UserPlus, Send, ArrowRight, LogOut } from 'lucide-react';

const TeamDetails = () => {
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects'); // projects, team, chat
  const socket = useSocketStore(state => state.socket);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', members: [] });
  const [newUid, setNewUid] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTeamData();

    if (socket) {
      socket.emit('join_team', id);
      
      const handleTeamUpdated = (updatedTeam) => setTeam(updatedTeam);
      const handleProjectCreated = (newProj) => setProjects(prev => [...prev, newProj]);
      const handleProjectDeleted = (projId) => setProjects(prev => prev.filter(p => p._id !== projId));

      socket.on('team_updated', handleTeamUpdated);
      socket.on('project_created', handleProjectCreated);
      socket.on('project_deleted', handleProjectDeleted);

      return () => {
        socket.off('team_updated', handleTeamUpdated);
        socket.off('project_created', handleProjectCreated);
        socket.off('project_deleted', handleProjectDeleted);
      };
    }
  }, [id, socket]);

  useEffect(() => {
    if (activeTab === 'chat') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchTeamData = async () => {
    try {
      const [teamRes, projRes] = await Promise.all([
        api.get(`/teams/${id}`),
        api.get(`/projects/team/${id}`)
      ]);
      setTeam(teamRes.data);
      setProjects(projRes.data);
    } catch (error) {
      console.error("Failed to fetch team:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${id}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch chat:", error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { ...newProject, team: id });
      // state updated via socket
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', members: [] });
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${id}`);
      window.location.href = '/teams';
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/teams/${id}/members/add`, { uid: newUid });
      // state updated via socket
      setNewUid('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (uidToRemove) => {
    if (!window.confirm("Remove this member from the team?")) return;
    try {
      await api.delete(`/teams/${id}/members/${uidToRemove}`);
      // state updated via socket
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await api.post(`/chat/${id}`, { text: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div></div>;

  const isAdminOrOwner = user?.role === 'Admin' || String(team?.owner?._id || team?.owner) === String(user?._id);
  const isOwner = String(team?.owner?._id || team?.owner) === String(user?._id);
  const isMember = team?.members.some(m => String(m._id) === String(user?._id));

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    try {
      await api.post(`/teams/${id}/leave`);
      window.location.href = '/teams';
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to leave team');
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 flex-shrink-0 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{team?.name}</h1>
            {team?.tid && (
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <span className="px-3 py-1 text-xs font-mono text-gray-300 border-r border-gray-700">TID: {team.tid}</span>
                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join/${team.tid}`)} className="px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="Copy Join Link">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-400">{team?.description}</p>
        </div>
        
        <div className="flex space-x-2">
          <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 rounded-lg flex items-center transition-colors ${activeTab === 'projects' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            <LayoutGrid className="w-4 h-4 mr-2" /> Projects
          </button>
          <button onClick={() => setActiveTab('team')} className={`px-4 py-2 rounded-lg flex items-center transition-colors ${activeTab === 'team' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            <Users className="w-4 h-4 mr-2" /> Members
          </button>
          <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 rounded-lg flex items-center transition-colors ${activeTab === 'chat' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            <MessageSquare className="w-4 h-4 mr-2" /> Team Chat
          </button>
        </div>
      </div>

      {activeTab === 'projects' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Team Projects</h2>
            {isAdminOrOwner && (
              <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">
                <Plus className="w-5 h-5 mr-2" /> New Project
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <Link to={`/projects/${proj._id}`} key={proj._id}>
                <motion.div whileHover={{ y: -5 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-[var(--color-primary)] transition-colors group relative cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-800 rounded-xl text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-primary)] transition-colors flex items-center">
                    {proj.name}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">{proj.description}</p>
                </motion.div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed">
                <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No projects yet in this team.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Team Members</h3>
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-white font-bold">
                    {team.owner.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{team.owner.name} <span className="ml-2 text-xs bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-0.5 rounded">Owner</span></h4>
                    <p className="text-gray-400 text-sm">{team.owner.uid}</p>
                  </div>
                </div>
              </div>
              {team.members.map(member => (
                <div key={member._id} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-600 to-gray-500 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{member.name}</h4>
                      <p className="text-gray-400 text-sm">{member.uid}</p>
                    </div>
                  </div>
                  {isAdminOrOwner && (
                    <button onClick={() => handleRemoveMember(member.uid)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {isAdminOrOwner && (
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Add Member</h3>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <input type="text" required placeholder="e.g. U-XYZ123" className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={newUid} onChange={(e) => setNewUid(e.target.value)} />
                    <button type="submit" className="w-full py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">Add to Team</button>
                  </form>
                </div>
              )}
              {isAdminOrOwner && (
                <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                  <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center">Danger Zone</h3>
                  <p className="text-sm text-red-400/80 mb-4">Permanently delete this team and all associated projects.</p>
                  <button onClick={handleDeleteTeam} className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Team
                  </button>
                </div>
              )}
              {isMember && !isOwner && (
                <div className="bg-orange-500/10 p-6 rounded-2xl border border-orange-500/20 mt-6">
                  <h3 className="text-lg font-bold text-orange-400 mb-2 flex items-center">Leave Team</h3>
                  <p className="text-sm text-orange-400/80 mb-4">You will lose access to all projects in this team.</p>
                  <button onClick={handleLeaveTeam} className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center">
                    <LogOut className="w-4 h-4 mr-2" /> Leave Team
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col overflow-hidden relative">
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {messages.map((msg) => {
              const isMe = msg.sender._id === user._id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? 'bg-[var(--color-primary)] text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                    {!isMe && <p className="text-xs font-medium text-[var(--color-primary)] mb-1">{msg.sender.name}</p>}
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"><Send className="w-6 h-6" /></button>
            </form>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create Project</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                  <input type="text" required className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-[var(--color-primary)]" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea rows="3" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white outline-none resize-none focus:ring-2 focus:ring-[var(--color-primary)]" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}></textarea>
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

export default TeamDetails;
