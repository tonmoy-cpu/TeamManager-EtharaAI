import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useSocketStore } from './store/useSocketStore';
import { useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import ProjectDetails from './pages/ProjectDetails';
import MyTasks from './pages/MyTasks';
import Settings from './pages/Settings';
import JoinTeam from './pages/JoinTeam';
import UserProfile from './pages/UserProfile';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const connectSocket = useSocketStore((state) => state.connectSocket);
  const disconnectSocket = useSocketStore((state) => state.disconnectSocket);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, connectSocket, disconnectSocket]);

  useEffect(() => {
    if (user?.themeColor) {
      document.documentElement.setAttribute('data-theme', user.themeColor);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [user?.themeColor]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:id" element={<TeamDetails />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="settings" element={<Settings />} />
          <Route path="join/:tid" element={<JoinTeam />} />
          <Route path="profile/:uid" element={<UserProfile />} />
          <Route path="dashboard" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
