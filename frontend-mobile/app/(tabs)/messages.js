import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../src/contexts/AuthContext';
import { useNotifications } from '../../src/contexts/NotificationContext';
import { matchAPI, messageAPI, userAPI, profileAPI, photoAPI } from '../../src/services/api';
import { theme } from '../../src/styles/theme';

export default function Messages() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getCurrentUserId } = useAuth();
  const { clearMessageNotifications } = useNotifications();
  const flatListRef = useRef(null);

  // Restore last viewed state when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // This will be handled in loadMatches after matches are loaded
    }, [])
  );

  useEffect(() => {
    // Only show loading on initial mount
    const initialLoad = async () => {
      setLoading(true);
      await loadMatches();
      setLoading(false);
    };
    initialLoad();
    // Clear message notifications when user visits messages page
    clearMessageNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for new messages to update previews (less frequently to reduce API calls)
  useEffect(() => {
    if (!selectedMatch) {
      const interval = setInterval(() => {
        // Only refresh matches list if no conversation is selected (silently, no loading state)
        loadMatches(false); // Silent background refresh
      }, 15000); // Poll every 15 seconds (reduced from 5 seconds)
      
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatch]);

  useEffect(() => {
    if (selectedMatch && selectedMatch.matchId) {
      // Save the selected match ID to restore state later
      AsyncStorage.setItem('lastSelectedMatchId', selectedMatch.matchId.toString()).catch(() => {
        // Ignore storage errors
      });
      
      // Mark all messages in this match as read when opening conversation
      messageAPI.markAllAsRead(selectedMatch.matchId).catch((error) => {
        console.error('Error marking messages as read:', error);
      });
      
      loadMessages(selectedMatch.matchId, false);
      // Clear notifications when viewing a conversation
      clearMessageNotifications();
      // Refresh matches list silently to update preview (mark as read)
      loadMatches(false);
      
      // Set up polling to refresh messages (less frequently to reduce API calls)
      const interval = setInterval(() => {
        loadMessages(selectedMatch.matchId, false); // Silent background refresh
        // Also refresh matches list to update preview
        loadMatches(false);
      }, 5000); // Poll every 5 seconds (increased from 2 seconds)
      
      return () => clearInterval(interval);
    } else if (selectedMatch === null) {
      // User went back to preview, clear saved state immediately
      AsyncStorage.removeItem('lastSelectedMatchId').catch(() => {
        // Ignore storage errors
      });
      // Refresh matches list silently to update preview cards
      loadMatches(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatch]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMatches = async (isRefresh = false) => {
    try {
      // Only set refreshing for user-initiated pull-to-refresh
      // Don't set loading state for automatic background updates
      if (isRefresh) {
        setRefreshing(true);
      } else if (loading && matches.length === 0) {
        // Only set loading on initial load when we have no matches
        setLoading(true);
      }
      
      const userId = getCurrentUserId();
      const allMatches = await matchAPI.getAll();
      const allUsers = await userAPI.getAll();

      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });

      const allProfiles = await profileAPI.getAll();

      // Enrich matches with user data, photos, and latest message preview
      const enrichedMatches = await Promise.all(
        userMatches.map(async (match) => {
          const user1Id = match.user1?.userId || match.user1?.id;
          const user2Id = match.user2?.userId || match.user2?.id;
          const otherUserId = user1Id === userId ? user2Id : user1Id;
          const otherUser = allUsers.find(u => u.userId === otherUserId);
          const otherProfile = allProfiles.find(p => p.user?.userId === otherUserId);

          // Load photo
          let photoUrl = null;
          if (otherProfile?.profileId) {
            try {
              const photos = await photoAPI.getByProfile(otherProfile.profileId);
              const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
              photoUrl = primaryPhoto?.photoUrl;
            } catch (error) {
              console.error(`Error loading photo for user ${otherUserId}:`, error);
            }
          }

          // Get latest message for preview (use optimized endpoint)
          let latestMessage = null;
          try {
            latestMessage = await messageAPI.getLatestByMatch(match.matchId);
          } catch (error) {
            // No messages yet or endpoint doesn't exist - ignore silently
            if (error.response?.status !== 404) {
              console.error(`Error loading latest message for match ${match.matchId}:`, error);
            }
          }

          return {
            ...match,
            otherUser,
            photoUrl,
            latestMessage,
          };
        })
      );

      // Sort by latest message timestamp (most recent first)
      enrichedMatches.sort((a, b) => {
        const aTime = a.latestMessage?.timestamp || a.latestMessage?.sentAt || 0;
        const bTime = b.latestMessage?.timestamp || b.latestMessage?.sentAt || 0;
        return new Date(bTime) - new Date(aTime);
      });

      setMatches(enrichedMatches);
      
      // Only restore last selected match on initial load (when selectedMatch is null and we haven't loaded yet)
      if (enrichedMatches.length > 0 && !selectedMatch && loading && !isRefresh) {
        // Try to restore from AsyncStorage only on initial load
        try {
          const savedMatchId = await AsyncStorage.getItem('lastSelectedMatchId');
          if (savedMatchId) {
            const matchId = parseInt(savedMatchId, 10);
            const foundMatch = enrichedMatches.find(m => m.matchId === matchId);
            if (foundMatch) {
              setSelectedMatch(foundMatch);
              return; // Don't set default match
            } else {
              // Saved match no longer exists, clear it
              await AsyncStorage.removeItem('lastSelectedMatchId');
            }
          }
        } catch (error) {
          console.error('Error restoring saved match:', error);
        }
        // No saved state or saved match not found, don't auto-select on initial load
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      // Only clear loading/refreshing if we set them
      if (loading && matches.length === 0) {
        setLoading(false);
      }
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadMatches(true);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMessages = async (matchId, isRefresh = false) => {
    try {
      // Silently load messages in background - no loading state
      const allMessages = await messageAPI.getByMatch(matchId);
      // Backend returns messages in ascending order (oldest first)
      // Keep as-is: oldest at top, newest at bottom
      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    // Note: We don't set refreshing here - only for explicit pull-to-refresh
  };

  const onRefreshMessages = async () => {
    setRefreshing(true);
    try {
      if (selectedMatch) {
        // For messages view, just reload messages silently
        await loadMessages(selectedMatch.matchId, false);
      } else {
        // For preview list, reload matches with refresh indicator
        await loadMatches(true);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      await messageAPI.create({
        match: { matchId: selectedMatch.matchId },
        sender: { userId: getCurrentUserId() },
        messageContent: newMessage.trim(),
      });
      setNewMessage('');
      // Refresh messages silently after sending (no loading state)
      await loadMessages(selectedMatch.matchId, false);
      // Also refresh matches list silently to update preview
      await loadMatches(false);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = (item.sender?.userId || item.sender?.id) === getCurrentUserId();
    return (
      <View style={[styles.message, isOwn ? styles.ownMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
          {item.messageContent || item.content}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  const renderConversation = ({ item }) => {
    const userId = getCurrentUserId();
    const previewText = item.latestMessage
      ? (item.latestMessage.messageContent || item.latestMessage.content || '')
      : 'No messages yet';
    const previewTime = item.latestMessage
      ? new Date(item.latestMessage.timestamp || item.latestMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    
    // Check if latest message is unread and from the other user
    // Also check if this conversation is not currently selected (don't show dot if viewing it)
    const isUnread = item.latestMessage && 
      (item.latestMessage.sender?.userId || item.latestMessage.sender?.id) !== userId &&
      !item.latestMessage.isRead &&
      selectedMatch?.matchId !== item.matchId;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          isUnread && styles.conversationItemUnread,
          selectedMatch?.matchId === item.matchId && styles.conversationItemActive,
        ]}
        onPress={() => setSelectedMatch(item)}
      >
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.conversationAvatarImage} />
        ) : (
          <View style={styles.conversationAvatar}>
            <Text style={styles.conversationAvatarText}>
              {item.otherUser?.firstName?.[0]}{item.otherUser?.lastName?.[0]}
            </Text>
          </View>
        )}
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[
              styles.conversationName,
              isUnread && styles.conversationNameUnread
            ]} numberOfLines={1}>
              {item.otherUser?.firstName} {item.otherUser?.lastName}
            </Text>
            <View style={styles.timeContainer}>
              {previewTime && (
                <Text style={[
                  styles.conversationTime,
                  isUnread && styles.conversationTimeUnread
                ]}>{previewTime}</Text>
              )}
              {isUnread && (
                <View style={styles.unreadIndicator}>
                  <View style={styles.unreadDot} />
                </View>
              )}
            </View>
          </View>
          <Text style={[
            styles.conversationPreview,
            isUnread && styles.conversationPreviewUnread
          ]} numberOfLines={1}>
            {previewText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {selectedMatch ? (
        <View style={styles.messagesView}>
          {/* Header with back button */}
          <View style={styles.messagesHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                // Clear saved state immediately when going back
                AsyncStorage.removeItem('lastSelectedMatchId').catch(() => {});
                setSelectedMatch(null);
              }}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.messagesHeaderName}>
              {selectedMatch.otherUser?.firstName} {selectedMatch.otherUser?.lastName}
            </Text>
          </View>

          {/* Messages */}
          <KeyboardAvoidingView
            style={styles.messagesContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.messageId?.toString()}
              contentContainerStyle={styles.messagesList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefreshMessages} />
              }
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                autoCapitalize="sentences"
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      ) : (
        <View style={styles.conversationsView}>
          <Text style={styles.conversationsTitle}>Messages</Text>
          <FlatList
            data={matches}
            renderItem={renderConversation}
            keyExtractor={(item) => item.matchId?.toString()}
            contentContainerStyle={matches.length === 0 ? styles.emptyContainer : styles.conversationsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No conversations yet</Text>
                <Text style={styles.emptySubtext}>Start swiping to find matches!</Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  conversationsView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  conversationsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  conversationsList: {
    gap: theme.spacing.sm,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    gap: theme.spacing.md,
    position: 'relative',
  },
  conversationItemUnread: {
    borderColor: theme.colors.accentPrimary,
    borderWidth: 2,
    backgroundColor: theme.colors.bgSecondary,
  },
  conversationItemActive: {
    backgroundColor: theme.colors.bgSecondary,
    borderColor: theme.colors.accentPrimary,
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: theme.colors.accentPrimary,
  },
  conversationAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  conversationPreview: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  conversationPreviewUnread: {
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  conversationNameUnread: {
    fontWeight: '700',
  },
  conversationTimeUnread: {
    fontWeight: '600',
    color: theme.colors.accentPrimary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accentPrimary,
  },
  unreadDot: {
    // No inner dot needed
  },
  messagesView: {
    flex: 1,
  },
  messagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  messagesHeaderName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  message: {
    maxWidth: '75%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.accentPrimary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  messageText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  ownMessageText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
    backgroundColor: theme.colors.bgCard,
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.bgSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 16, // Prevents zoom on iOS
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.accentPrimary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
});
