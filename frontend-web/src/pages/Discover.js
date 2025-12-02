import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, profileAPI, swipeAPI, matchAPI, photoAPI } from '../services/api';
import DiscoverCard from '../components/DiscoverCard';
import './Discover.css';

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    years: [],
    locationEnabled: false,
    maxDistance: 50,
  });
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeChats: 0,
  });
  const { getCurrentUserId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadStats = async () => {
    try {
      const matches = await matchAPI.getAll();
      setStats({
        totalMatches: matches.length,
        activeChats: matches.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const currentUserId = getCurrentUserId();
      const [allUsers, allProfiles, swipes] = await Promise.all([
        userAPI.getAll(),
        profileAPI.getAll(),
        swipeAPI.getByUser(currentUserId),
      ]);

      const swipedUserIds = new Set(swipes.map(s => s.swipee?.userId || s.swipee?.id));

      // Merge user and profile data and load photos
      let filteredUsers = await Promise.all(
        allUsers
          .filter(user => user.userId !== currentUserId && !swipedUserIds.has(user.userId))
          .map(async (user) => {
            const profile = allProfiles.find(p => p.user?.userId === user.userId);
            let photoUrl = null;
            
            // Load primary photo if profile exists
            if (profile?.profileId) {
              try {
                const photos = await photoAPI.getByProfile(profile.profileId);
                const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
                photoUrl = primaryPhoto?.photoUrl;
              } catch (error) {
                console.error(`Error loading photo for user ${user.userId}:`, error);
              }
            }
            
            return {
              ...user,
              profile: profile,
              major: profile?.major || '',
              location: profile?.location || user.location || '',
              latitude: profile?.latitude || user.latitude,
              longitude: profile?.longitude || user.longitude,
              photoUrl: photoUrl,
            };
          })
      );

      // Calculate distances for all users if current user has location
      const currentUser = allUsers.find(u => u.userId === currentUserId);
      const currentProfile = allProfiles.find(p => p.user?.userId === currentUserId);
      const currentLat = currentProfile?.latitude || currentUser?.latitude;
      const currentLon = currentProfile?.longitude || currentUser?.longitude;

      if (currentLat && currentLon) {
        filteredUsers.forEach(user => {
          if (user.latitude && user.longitude) {
            user._distance = calculateDistance(currentLat, currentLon, user.latitude, user.longitude);
          }
        });
      }

      // Apply year filter
      if (filters.years.length > 0) {
        filteredUsers = filteredUsers.filter(user => {
          return user.profile && filters.years.includes(user.profile.year);
        });
      }

      // Apply location filter
      if (filters.locationEnabled) {
        filteredUsers = filteredUsers.filter(user => {
          if (!user.latitude || !user.longitude) return false;
          return user._distance <= filters.maxDistance;
        });
      }

      setUsers(filteredUsers);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    const isLike = direction === 'right';

    try {
      await swipeAPI.create({
        swiper: { userId: getCurrentUserId() },
        swipee: { userId: currentUser.userId },
        isLike,
      });

      if (isLike) {
        setTimeout(() => loadStats(), 500);
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error performing swipe:', error);
    }
  };

  const toggleYearFilter = (year) => {
    setFilters(prev => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter(y => y !== year)
        : [...prev.years, year],
    }));
  };

  const toggleLocationFilter = () => {
    setFilters(prev => ({
      ...prev,
      locationEnabled: !prev.locationEnabled,
    }));
  };

  const currentUser = users[currentIndex];

  if (loading) {
    return (
      <div className="discover-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="discover-container">
      <div className="discover-layout">
        {/* Left Sidebar - Filters */}
        <aside className="discover-sidebar">
          <div className="filter-section">
            <h3>Year</h3>
            <div className="filter-pills">
              {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Faculty'].map(year => (
                <button
                  key={year}
                  className={`filter-pill ${filters.years.includes(year) ? 'active' : ''}`}
                  onClick={() => toggleYearFilter(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Location</h3>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.locationEnabled}
                onChange={toggleLocationFilter}
              />
              <span>Show nearby users only</span>
            </label>
            {filters.locationEnabled && (
              <div className="filter-range">
                <label>Max distance: {filters.maxDistance} km</label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                />
              </div>
            )}
          </div>

          <div className="stats-section">
            <h3>YOUR STATS</h3>
            <div className="stat-item">
              <span className="stat-label">Total Matches</span>
              <span className="stat-value">{stats.totalMatches}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Chats</span>
              <span className="stat-value">{stats.activeChats}</span>
            </div>
          </div>
        </aside>

        {/* Center - Card Stack */}
        <main className="discover-main">
          <div className="card-stack">
            <AnimatePresence mode="wait">
              {currentUser ? (
                <DiscoverCard
                  key={currentUser.userId}
                  user={currentUser}
                  onSwipe={handleSwipe}
                  onViewProfile={() => navigate(`/profile/${currentUser.userId}`)}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="empty-state"
                >
                  <h2>No more users!</h2>
                  <p>Check back later for new profiles.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Sidebar - Quick Actions */}
        <aside className="discover-sidebar-right">
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate('/matches')}
          >
            View All Matches
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Discover;

