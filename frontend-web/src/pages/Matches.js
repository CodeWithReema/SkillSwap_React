import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { matchAPI, profileAPI, userAPI } from '../services/api';
import './Matches.css';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getCurrentUserId } = useAuth();
  const { clearMatchNotifications } = useNotifications();

  useEffect(() => {
    // Clear match notifications when user visits matches page
    clearMatchNotifications();
  }, [clearMatchNotifications]);
  const navigate = useNavigate();

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

      // Get matches where current user is involved
      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });

      // Enrich matches with user and profile data
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
      <div className="matches-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1>Your Matches</h1>
        <p>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</p>
      </div>

      {matches.length === 0 ? (
        <div className="empty-matches">
          <h2>No matches yet</h2>
          <p>Start swiping to find your skill exchange partners!</p>
          <button className="btn btn-primary" onClick={() => navigate('/discover')}>
            Go to Discover
          </button>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map(match => (
            <div key={match.matchId} className="match-card">
              <div className="match-avatar">
                {match.otherUser?.firstName?.[0]}{match.otherUser?.lastName?.[0]}
              </div>
              <div className="match-info">
                <h3>{match.otherUser?.firstName} {match.otherUser?.lastName}</h3>
                <p className="match-major">{match.otherProfile?.major || 'No major specified'}</p>
                <p className="match-bio">{match.otherProfile?.bio || 'No bio available'}</p>
              </div>
              <div className="match-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/profile/${match.otherUser?.userId}`)}
                >
                  View Profile
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/messages')}
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;

