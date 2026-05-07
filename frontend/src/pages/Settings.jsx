import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { User, Mail, Paintbrush, FileText, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const { user, updateUser, setTheme } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const themes = [
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      const res = await api.put('/users/profile', formData);
      updateUser(res.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (themeValue) => {
    try {
      const res = await api.put('/users/profile', { themeColor: themeValue });
      updateUser(res.data);
      setTheme(themeValue);
    } catch (err) {
      console.error("Failed to update theme", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              Profile Details
            </h2>
            {user?.uid && (
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 font-mono">
                  {user.uid}
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/profile/${user.uid}`);
                    setSuccess('Profile link copied!');
                    setTimeout(() => setSuccess(''), 2000);
                  }}
                  className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/50 rounded-lg text-sm hover:bg-[var(--color-primary)]/30 transition-colors"
                >
                  Share Profile
                </button>
              </div>
            )}
          </div>
          
          {success && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-lg flex items-center text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2" /> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Bio / Title</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
                <textarea
                  rows="3"
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Software Engineer, Product Manager..."
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-fit"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Paintbrush className="w-5 h-5 mr-2 text-primary" />
            Theme Color
          </h2>
          <p className="text-sm text-gray-400 mb-4">Choose a primary accent color for your workspace.</p>
          
          <div className="grid grid-cols-2 gap-4">
            {themes.map((theme) => {
              const isSelected = user?.themeColor === theme.value || (!user?.themeColor && theme.value === 'purple');
              return (
                <button
                  key={theme.value}
                  onClick={() => handleThemeChange(theme.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    isSelected ? 'border-[var(--color-primary)] bg-gray-800' : 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full mb-2 ${theme.class} shadow-lg`}></div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
