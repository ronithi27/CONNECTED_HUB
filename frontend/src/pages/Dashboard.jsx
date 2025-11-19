import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Mail, Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="dashboard-nav">
          <div className="nav-brand">
            <Sparkles size={28} />
            <h2>ConnectHub</h2>
          </div>
          <motion.button
            className="logout-btn"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </motion.button>
        </nav>

        <motion.div
          className="welcome-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="welcome-header">
            <motion.div
              className="avatar"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </motion.div>
            <h1>Welcome back, {user?.username}! 🎉</h1>
            <p>You're now connected to ConnectHub</p>
          </div>

          <div className="user-details">
            <div className="detail-card">
              <User size={24} />
              <div>
                <label>Username</label>
                <span>{user?.username}</span>
              </div>
            </div>
            <div className="detail-card">
              <Mail size={24} />
              <div>
                <label>Email</label>
                <span>{user?.email}</span>
              </div>
            </div>
            <div className="detail-card">
              <Calendar size={24} />
              <div>
                <label>Member Since</label>
                <span>{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="features-preview">
            <h3>Coming Soon</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span>📝</span>
                <p>Create Posts</p>
              </div>
              <div className="feature-item">
                <span>👥</span>
                <p>Connect with Friends</p>
              </div>
              <div className="feature-item">
                <span>💬</span>
                <p>Real-time Chat</p>
              </div>
              <div className="feature-item">
                <span>🔔</span>
                <p>Notifications</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
