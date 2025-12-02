import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const DiscoverCard = ({ user, onSwipe, onViewProfile }) => {
  const [exitX, setExitX] = useState(0);
  const [imageError, setImageError] = useState(false);
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
      className="glass-card-hover w-full max-w-2xl mx-auto cursor-grab active:cursor-grabbing relative overflow-hidden"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }}
      exit={{ x: exitX, opacity: 0, rotate: exitX / 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
    >
      {/* Asymmetric gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-glass-accent-primary/15 via-transparent to-glass-accent-secondary/15 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-glass-accent-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-4xl font-bold text-glass-text-primary mb-2 bg-gradient-primary bg-clip-text text-transparent truncate">
              {user.firstName} {user.lastName}
            </h2>
            <div className="flex items-center gap-2 text-glass-text-secondary">
              <span className="text-lg flex-shrink-0">🎓</span>
              <span className="text-lg truncate">{user.university || 'University'}</span>
            </div>
          </div>
          <button 
            onClick={onViewProfile}
            className="text-glass-accent-primary hover:text-glass-accent-secondary text-sm font-semibold transition-colors px-4 py-2 rounded-xl bg-glass-bg-card border border-glass-border hover:border-glass-border-light transform hover:scale-105 flex-shrink-0 ml-4"
          >
            View Profile →
          </button>
        </div>

        {/* Large Profile Image - Different Layout */}
        <div className="flex justify-center mb-8">
          {user.photoUrl && !imageError ? (
            <div className="relative">
              <img
                src={user.photoUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-64 h-64 rounded-3xl object-cover border-2 border-glass-border shadow-glass-xl"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-glass-accent-primary/20 to-glass-accent-secondary/20 pointer-events-none"></div>
            </div>
          ) : (
            <div className="w-64 h-64 rounded-3xl bg-gradient-primary flex items-center justify-center text-6xl font-bold text-white border-2 border-glass-border shadow-glass-xl">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
        </div>

        {/* Info Grid - Different Layout */}
        <div className="space-y-4 mb-8">
          {(user.major || user.location) && (
            <div className="grid grid-cols-2 gap-4">
              {user.major && (
                <div className="dashboard-card p-4">
                  <div className="text-2xl mb-2">📚</div>
                  <div className="text-sm text-glass-text-secondary mb-1">Major</div>
                  <div className="text-lg font-semibold text-glass-text-primary">{user.major}</div>
                </div>
              )}
              {user.location && (
                <div className="dashboard-card p-4">
                  <div className="text-2xl mb-2">📍</div>
                  <div className="text-sm text-glass-text-secondary mb-1">Location</div>
                  <div className="text-lg font-semibold text-glass-text-primary truncate" title={user.location}>
                    {user.location}
                  </div>
                </div>
              )}
            </div>
          )}
          {user._distance !== undefined && user._distance !== null && (
            <div className="dashboard-card p-4">
              <div className="text-2xl mb-2">📏</div>
              <div className="text-sm text-glass-text-secondary mb-1">Distance</div>
              <div className="text-lg font-semibold text-glass-accent-primary">
                {user._distance < 1
                  ? `${Math.round(user._distance * 1000)} m away`
                  : `${user._distance.toFixed(1)} km away`}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Horizontal Layout */}
        <div className="flex gap-4">
          <button
            className="flex-1 py-5 px-6 rounded-2xl transition-all duration-200 font-semibold flex items-center justify-center gap-3 text-lg hover:shadow-glass transform hover:scale-105"
            onClick={() => handleSwipeButton('left')}
            aria-label="Pass"
            style={{ 
              borderWidth: '3px', 
              borderColor: '#ef4444', 
              borderStyle: 'solid',
              color: '#ef4444',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="text-2xl" style={{ color: '#ef4444' }}>✕</span>
            <span style={{ color: '#ef4444' }}>PASS</span>
          </button>
          <button
            className="flex-1 py-5 px-6 rounded-2xl bg-gradient-primary text-white hover:shadow-glass-xl hover:shadow-glow-multi transition-all duration-200 font-semibold flex items-center justify-center gap-3 text-lg transform hover:-translate-y-1 hover:scale-105"
            onClick={() => handleSwipeButton('right')}
            aria-label="Like"
          >
            <span className="text-2xl">❤️</span>
            <span>LIKE</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscoverCard;
