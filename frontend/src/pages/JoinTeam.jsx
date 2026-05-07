import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const JoinTeam = () => {
  const { tid } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [project, setProject] = useState(null);

  useEffect(() => {
    const joinTeam = async () => {
      try {
        const res = await api.post('/teams/join', { tid });
        setProject(res.data);
        setStatus('success');
        setMessage(`Successfully joined ${res.data.name}!`);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(`/teams/${res.data._id}`);
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to join team. Invalid TID or you are already a member.');
      }
    };
    
    if (tid) joinTeam();
  }, [tid, navigate]);

  return (
    <div className="max-w-md mx-auto mt-20 bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white">Joining Team...</h2>
          <p className="text-gray-400 mt-2">Please wait while we verify the Team ID ({tid}).</p>
        </div>
      )}
      
      {status === 'success' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
          <p className="text-gray-400">Redirecting to workspace...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Join Failed</h2>
          <p className="text-gray-400 mb-6">{message}</p>
          <Link to="/teams" className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">
            Back to Teams
          </Link>
        </div>
      )}
    </div>
  );
};

export default JoinTeam;
