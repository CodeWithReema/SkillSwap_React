import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

  const checkForNewMatches = async () => {
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
      const previousCount = lastMatchCountRef.current;
      
      // Only update badge count if count increased and we had a previous baseline
      if (currentCount > previousCount && previousCount >= 0) {
        const newMatches = currentCount - previousCount;
        if (newMatches > 0) {
          // Just update badge count, no popup
          setUnreadMatches(prev => prev + newMatches);
        }
      }
      lastMatchCountRef.current = currentCount;
    } catch (error) {
      console.error('Error checking for new matches:', error);
    }
  };

  const checkForNewMessages = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      // Only check if we're not on the messages page (to avoid duplicate calls)
      // We'll use a simpler approach: just check match count changes
      // For messages, we'll rely on the messages page polling
      // This reduces API calls significantly
      
      const allMatches = await matchAPI.getAll();
      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });

      // Check only the latest message per match (more efficient)
      let totalNewMessages = 0;
      for (const match of userMatches) {
        try {
          // Use the latest message endpoint to avoid loading all messages
          const latestMessage = await messageAPI.getLatestByMatch(match.matchId);
          if (latestMessage) {
            const senderId = latestMessage.sender?.userId || latestMessage.sender?.id;
            // Only count if it's from the other user and unread
            if (senderId !== userId && !latestMessage.isRead) {
              totalNewMessages += 1; // Count this match as having a new message
            }
          }
        } catch (error) {
          // Latest message endpoint might not exist or no messages yet - ignore
        }
      }

      const previousCount = lastMessageCountRef.current;
      
      // Update badge to show total unread messages (not just increments)
      // Only show badge if there are unread messages
      setUnreadMessages(totalNewMessages);
      
      // Update baseline for next check
      lastMessageCountRef.current = totalNewMessages;
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  };

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      // Reset when no user
      lastMatchCountRef.current = 0;
      lastMessageCountRef.current = 0;
      setUnreadMatches(0);
      setUnreadMessages(0);
      return;
    }

    // Initial check - set baseline counts without triggering notifications
    const initializeCounts = async () => {
      try {
        // Set baseline for matches
        const allMatches = await matchAPI.getAll();
        const userMatches = allMatches.filter(match => {
          const user1Id = match.user1?.userId || match.user1?.id;
          const user2Id = match.user2?.userId || match.user2?.id;
          return user1Id === userId || user2Id === userId;
        });
        lastMatchCountRef.current = userMatches.length;

        // Set baseline for messages - count matches with unread messages (more efficient)
        let matchesWithUnread = 0;
        for (const match of userMatches) {
          try {
            const latestMessage = await messageAPI.getLatestByMatch(match.matchId);
            if (latestMessage) {
              const senderId = latestMessage.sender?.userId || latestMessage.sender?.id;
              if (senderId !== userId && !latestMessage.isRead) {
                matchesWithUnread += 1;
              }
            }
          } catch (error) {
            // No messages yet or endpoint doesn't exist - ignore
          }
        }
        lastMessageCountRef.current = matchesWithUnread;
        // Don't set unreadMessages here - only track new ones
      } catch (error) {
        console.error('Error initializing notification counts:', error);
      }
    };

    initializeCounts();

    // Set up polling every 20 seconds (reduced frequency to minimize API calls)
    intervalRef.current = setInterval(() => {
      checkForNewMatches();
      checkForNewMessages();
    }, 20000); // Poll every 20 seconds (increased from 10 seconds)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCurrentUserId]);

  const clearMatchNotifications = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      // Update baseline to current count, then clear badge
      const allMatches = await matchAPI.getAll();
      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });
      lastMatchCountRef.current = userMatches.length;
      setUnreadMatches(0);
    } catch (error) {
      console.error('Error clearing match notifications:', error);
    }
  };

  const clearMessageNotifications = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      // Update baseline to current count, then clear badge
      const allMatches = await matchAPI.getAll();
      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });

      // Use latest message endpoint for efficiency
      let matchesWithUnread = 0;
      for (const match of userMatches) {
        try {
          const latestMessage = await messageAPI.getLatestByMatch(match.matchId);
          if (latestMessage) {
            const senderId = latestMessage.sender?.userId || latestMessage.sender?.id;
            if (senderId !== userId && !latestMessage.isRead) {
              matchesWithUnread += 1;
            }
          }
        } catch (error) {
          // No messages yet - ignore
        }
      }
      lastMessageCountRef.current = matchesWithUnread;
      // Update badge to show current unread count (not just clear it)
      setUnreadMessages(matchesWithUnread);
    } catch (error) {
      console.error('Error clearing message notifications:', error);
    }
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

