import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import './DiscoverCard.css';

const DiscoverCard = ({ user, onSwipe, onViewProfile }) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 200 : -200);
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  const handleSwipeButton = (direction) => {
    setExitX(direction === 'right' ? 200 : -200);
    onSwipe(direction);
  };

  return (
    <motion.div
      className="discover-card"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, x: 0, rotate: 0 }}
      exit={{ x: exitX, opacity: 0, rotate: exitX / 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <div className="card-header">
        <button className="view-profile-btn" onClick={onViewProfile}>
          View Full Profile →
        </button>
      </div>

      <div className="card-image">
        <div className="avatar-placeholder">
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
      </div>

      <div className="card-content">
        <h2 className="card-name">
          {user.firstName} {user.lastName}
        </h2>

        <div className="card-details">
          <div className="detail-item">
            <span className="detail-icon">🎓</span>
            <span>{user.university || 'University'}</span>
          </div>
          {user.major && (
            <div className="detail-item">
              <span className="detail-icon">📚</span>
              <span>{user.major}</span>
            </div>
          )}
          {user.location && (
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <span>{user.location}</span>
            </div>
          )}
          {user._distance !== undefined && (
            <div className="detail-item">
              <span className="detail-icon">📏</span>
              <span>
                {user._distance < 1
                  ? `${Math.round(user._distance * 1000)} m away`
                  : `${user._distance.toFixed(1)} km away`}
              </span>
            </div>
          )}
        </div>

        <div className="card-actions">
          <button
            className="swipe-btn swipe-btn-pass"
            onClick={() => handleSwipeButton('left')}
            aria-label="Pass"
          >
            <span className="swipe-icon">✕</span>
            <span className="swipe-text">PASS</span>
          </button>
          <button
            className="swipe-btn swipe-btn-like"
            onClick={() => handleSwipeButton('right')}
            aria-label="Like"
          >
            <span className="swipe-icon">❤️</span>
            <span className="swipe-text">LIKE</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscoverCard;

