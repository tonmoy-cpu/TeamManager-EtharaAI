import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { User, Mail, FileText, ArrowLeft, Loader2 } from 'lucide-react';

const UserProfile = () => {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/find/${uid}`);
        setProfile(res.data);
      } catch (err) {
        setError('User profile not found or invalid UID.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link to="/projects" className="text-[var(--color-primary)] hover:underline flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Workspace
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/projects" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Link>
      
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] opacity-20"></div>
        
        <div className="relative flex flex-col items-center sm:items-start sm:flex-row gap-6 mt-12">
          <div className="w-24 h-24 bg-gradient-to-tr from-[var(--color-primary)] to-pink-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-gray-900">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 mb-4">
              UID: {profile.uid}
            </div>
            
            <div className="space-y-3 text-gray-400">
              {profile.bio && (
                <div className="flex items-start">
                  <FileText className="w-5 h-5 mr-3 flex-shrink-0 text-gray-500" />
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-sm">{profile.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
