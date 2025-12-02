import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { matchAPI, profileAPI, userAPI } from '../services/api';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getCurrentUserId } = useAuth();
  const { clearMatchNotifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    clearMatchNotifications();
  }, [clearMatchNotifications]);

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMatches = async () => {
    try {
      const userId = getCurrentUserId();
      const allMatches = await matchAPI.getAll();
      const [allUsers, allProfiles] = await Promise.all([
        userAPI.getAll(),
        profileAPI.getAll(),
      ]);

      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });

      const enrichedMatches = userMatches.map(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        const otherUserId = user1Id === userId ? user2Id : user1Id;
        const otherUser = allUsers.find(u => u.userId === otherUserId);
        const otherProfile = allProfiles.find(p => p.user?.userId === otherUserId);

        return {
          ...match,
          otherUser,
          otherProfile,
        };
      });

      setMatches(enrichedMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen py-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-glass-accent-primary rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-glass-accent-secondary rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-6xl font-bold text-glass-text-primary mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Your Matches
          </h1>
          <p className="text-glass-text-secondary text-2xl">{matches.length} {matches.length === 1 ? 'match' : 'matches'}</p>
        </motion.div>

        {matches.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card text-center py-24"
          >
            <div className="text-8xl mb-8">💫</div>
            <h2 className="text-4xl font-bold text-glass-text-primary mb-6">No matches yet</h2>
            <p className="text-glass-text-secondary text-xl mb-10">Start swiping to find your skill exchange partners!</p>
            <button className="btn btn-primary text-xl px-12 py-6" onClick={() => navigate('/discover')}>
              Go to Discover
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {matches.map((match, index) => (
              <motion.div
                key={match.matchId}
                initial={{ opacity: 0, y: 30, rotate: index % 2 === 0 ? -2 : 2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                className="asymmetric-item group"
              >
                <div className="flex flex-col h-full">
                  {/* Profile Image Section - Top */}
                  <div className="relative mb-6 -mt-4 -mx-4">
                    <div className="w-full h-48 bg-gradient-primary rounded-t-3xl flex items-center justify-center">
                      {match.otherUser?.firstName?.[0] && match.otherUser?.lastName?.[0] ? (
                        <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl font-bold text-white border-4 border-white/30 shadow-glass-xl">
                          {match.otherUser.firstName[0]}{match.otherUser.lastName[0]}
                        </div>
                      ) : (
                        <div className="text-6xl">👤</div>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-glass-text-primary mb-2">
                        {match.otherUser?.firstName} {match.otherUser?.lastName}
                      </h3>
                      <p className="text-glass-accent-primary font-semibold text-lg">{match.otherProfile?.major || 'No major specified'}</p>
                    </div>
                    
                    <p className="text-glass-text-secondary text-sm mb-6 line-clamp-3 flex-1">
                      {match.otherProfile?.bio || 'No bio available'}
                    </p>
                    
                    <div className="flex gap-3 mt-auto">
                      <button
                        className="btn btn-secondary flex-1 text-sm"
                        onClick={() => navigate(`/profile/${match.otherUser?.userId}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-primary flex-1 text-sm"
                        onClick={() => navigate('/messages')}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
