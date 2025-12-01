import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear auth state
    logout();
    
    // Navigate to login - use replace to prevent back button issues
    // Small delay ensures state updates before navigation
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 50);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/discover" className="navbar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">SkillSwap</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/discover"
            className={`navbar-link ${isActive('/discover') ? 'active' : ''}`}
          >
            Discover
          </Link>
          <Link
            to="/matches"
            className={`navbar-link ${isActive('/matches') ? 'active' : ''}`}
          >
            Matches
          </Link>
          <Link
            to="/messages"
            className={`navbar-link ${isActive('/messages') ? 'active' : ''}`}
          >
            Messages
          </Link>
          <Link
            to="/profile"
            className={`navbar-link ${isActive('/profile') ? 'active' : ''}`}
          >
            Profile
          </Link>
        </div>

        <div className="navbar-user">
          <span className="navbar-username">
            {user?.firstName || 'User'}
          </span>
          <button 
            type="button"
            onClick={handleLogout} 
            className="btn btn-secondary btn-sm"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

