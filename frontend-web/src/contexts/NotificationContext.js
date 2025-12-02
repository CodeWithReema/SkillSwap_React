import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { matchAPI, messageAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { getCurrentUserId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadMatches, setUnreadMatches] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const lastMatchCountRef = useRef(0);
  const lastMessageCountRef = useRef(0);
  const intervalRef = useRef(null);

  const showNotification = useCallback((title, message) => {
    // Create a simple in-app notification
    const notification = {
      id: Date.now(),
      title,
      message,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const checkForNewMatches = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const allMatches = await matchAPI.getAll();
      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });

      const currentCount = userMatches.length;
      if (currentCount > lastMatchCountRef.current && lastMatchCountRef.current > 0) {
        const newMatches = currentCount - lastMatchCountRef.current;
        showNotification('🎉 New Match!', `You have ${newMatches} new match${newMatches > 1 ? 'es' : ''}!`);
        setUnreadMatches(prev => prev + newMatches);
      }
      lastMatchCountRef.current = currentCount;
    } catch (error) {
      console.error('Error checking for new matches:', error);
    }
  }, [getCurrentUserId, showNotification]);

  const checkForNewMessages = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const allMatches = await matchAPI.getAll();
      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });

      let totalNewMessages = 0;
      for (const match of userMatches) {
        try {
          const messages = await messageAPI.getByMatch(match.matchId);
          const unreadCount = messages.filter(msg => {
            const senderId = msg.sender?.userId || msg.sender?.id;
            return senderId !== userId && !msg.isRead;
          }).length;
          totalNewMessages += unreadCount;
        } catch (error) {
          console.error(`Error checking messages for match ${match.matchId}:`, error);
        }
      }

      if (totalNewMessages > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
        const newMessages = totalNewMessages - lastMessageCountRef.current;
        showNotification('💬 New Message!', `You have ${newMessages} new message${newMessages > 1 ? 's' : ''}!`);
        setUnreadMessages(prev => prev + newMessages);
      }
      lastMessageCountRef.current = totalNewMessages;
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  }, [getCurrentUserId, showNotification]);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return;

    // Initial check
    checkForNewMatches();
    checkForNewMessages();

    // Set up polling every 5 seconds
    intervalRef.current = setInterval(() => {
      checkForNewMatches();
      checkForNewMessages();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [getCurrentUserId, checkForNewMatches, checkForNewMessages]);

  const clearMatchNotifications = () => {
    setUnreadMatches(0);
    lastMatchCountRef.current = 0;
  };

  const clearMessageNotifications = () => {
    setUnreadMessages(0);
    lastMessageCountRef.current = 0;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadMatches,
        unreadMessages,
        clearMatchNotifications,
        clearMessageNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

