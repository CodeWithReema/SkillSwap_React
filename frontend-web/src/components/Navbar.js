import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { unreadMatches, unreadMessages } = useNotifications();

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    logout();
    
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 50);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-nav">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/discover" className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-glass-lg group-hover:shadow-glow-purple transition-all duration-300">
              🎓
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SkillSwap
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/discover"
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 relative ${
                isActive('/discover')
                  ? 'bg-glass-bg-light text-glass-text-primary shadow-glass border border-glass-border-light'
                  : 'text-glass-text-secondary hover:text-glass-text-primary hover:bg-glass-bg-card rounded-xl'
              }`}
            >
              Discover
            </Link>
            <Link
              to="/matches"
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 relative ${
                isActive('/matches')
                  ? 'bg-glass-bg-light text-glass-text-primary shadow-glass border border-glass-border-light'
                  : 'text-glass-text-secondary hover:text-glass-text-primary hover:bg-glass-bg-card rounded-xl'
              }`}
            >
              Matches
              {unreadMatches > 0 && (
                <span className="absolute -top-1 -right-1 bg-glass-accent-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-glow-pink">
                  {unreadMatches}
                </span>
              )}
            </Link>
            <Link
              to="/messages"
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 relative ${
                isActive('/messages')
                  ? 'bg-glass-bg-light text-glass-text-primary shadow-glass border border-glass-border-light'
                  : 'text-glass-text-secondary hover:text-glass-text-primary hover:bg-glass-bg-card rounded-xl'
              }`}
            >
              Messages
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-glass-accent-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-glow-pink">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                isActive('/profile')
                  ? 'bg-glass-bg-light text-glass-text-primary shadow-glass border border-glass-border-light'
                  : 'text-glass-text-secondary hover:text-glass-text-primary hover:bg-glass-bg-card rounded-xl'
              }`}
            >
              Profile
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-glass-text-secondary text-sm hidden md:block px-4 py-2 rounded-xl bg-glass-bg-card border border-glass-border">
              {user?.firstName || 'User'}
            </span>
            <button 
              type="button"
              onClick={handleLogout} 
              className="btn btn-secondary text-sm"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
