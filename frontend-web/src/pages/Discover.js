import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, profileAPI, swipeAPI, matchAPI, photoAPI } from '../services/api';
import DiscoverCard from '../components/DiscoverCard';

const Discover = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    years: [],
    locationEnabled: false,
    maxDistance: 50,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeChats: 0,
  });
  const { getCurrentUserId } = useAuth();
  const navigate = useNavigate();

  // Convert relative photo URLs to absolute URLs
  const toAbsoluteUrl = (url) => {
    if (!url) return null;
    try {
      // If already absolute URL, return as-is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      const base = process.env.REACT_APP_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
      return new URL(url, base).toString();
    } catch (e) {
      console.error('Error converting photo URL:', e, url);
      return url;
    }
  };

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

      let filteredUsers = await Promise.all(
        allUsers
          .filter(user => user.userId !== currentUserId && !swipedUserIds.has(user.userId))
          .map(async (user) => {
            const profile = allProfiles.find(p => p.user?.userId === user.userId);
            let photoUrl = null;
            
            if (profile?.profileId) {
              try {
                const photos = await photoAPI.getByProfile(profile.profileId);
                const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
                photoUrl = primaryPhoto?.photoUrl ? toAbsoluteUrl(primaryPhoto.photoUrl) : null;
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

      if (filters.years.length > 0) {
        filteredUsers = filteredUsers.filter(user => {
          return user.profile && filters.years.includes(user.profile.year);
        });
      }

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
    const R = 6371;
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
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-glass-accent-primary rounded-full mix-blend-screen opacity-20 blur-3xl animate-pulse-slow"></div>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-glass-accent-primary relative z-10"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-glass-accent-primary rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-glass-accent-secondary rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Dashboard Style Layout - Completely Different */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Left Column - Stats Dashboard Cards */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="dashboard-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-glass-text-primary">Matches</h3>
                <span className="text-3xl">💫</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stats.totalMatches}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="dashboard-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-glass-text-primary">Active Chats</h3>
                <span className="text-3xl">💬</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stats.activeChats}
              </div>
            </motion.div>

            {/* Filter Toggle */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="dashboard-card"
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full btn btn-secondary flex items-center justify-center gap-2"
              >
                <span className="text-xl">🔍</span>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </motion.div>
          </div>

          {/* Center - Main Card Area (Larger, More Prominent) */}
          <div className="col-span-12 lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-2xl">
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-card text-center py-20"
                  >
                    <div className="text-7xl mb-6">✨</div>
                    <h2 className="text-4xl font-bold text-glass-text-primary mb-4">No more users!</h2>
                    <p className="text-glass-text-secondary text-xl">Check back later for new profiles.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Quick Actions & Filters */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="dashboard-card"
              >
                <h3 className="text-lg font-bold text-glass-text-primary mb-4 flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  Filters
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-glass-text-secondary mb-3">Year</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Faculty'].map(year => (
                        <button
                          key={year}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                            filters.years.includes(year)
                              ? 'bg-gradient-primary text-white shadow-glass-lg shadow-glow-purple'
                              : 'bg-glass-bg-card text-glass-text-secondary hover:bg-glass-bg-hover hover:text-glass-text-primary border border-glass-border'
                          }`}
                          onClick={() => toggleYearFilter(year)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-glass-bg-card rounded-xl border border-glass-border hover:bg-glass-bg-hover transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.locationEnabled}
                        onChange={toggleLocationFilter}
                        className="w-5 h-5 rounded border-glass-border bg-glass-bg-card text-glass-accent-primary focus:ring-glass-accent-primary"
                      />
                      <span className="text-glass-text-secondary text-sm">Show nearby users only</span>
                    </label>
                    {filters.locationEnabled && (
                      <div className="mt-4 p-4 bg-glass-bg-card rounded-xl border border-glass-border">
                        <label className="block text-sm text-glass-text-secondary mb-2">
                          Max distance: {filters.maxDistance} km
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="200"
                          step="5"
                          value={filters.maxDistance}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-glass-bg-secondary rounded-lg appearance-none cursor-pointer accent-glass-accent-primary"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="dashboard-card"
            >
              <h3 className="text-lg font-bold text-glass-text-primary mb-4 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  className="w-full btn btn-primary text-sm"
                  onClick={() => navigate('/matches')}
                >
                  View All Matches
                </button>
                <button
                  className="w-full btn btn-secondary text-sm"
                  onClick={() => navigate('/messages')}
                >
                  Open Messages
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
