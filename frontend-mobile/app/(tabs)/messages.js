import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { matchAPI, messageAPI, userAPI } from '../../src/services/api';
import { theme } from '../../src/styles/theme';

export default function Messages() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { getCurrentUserId } = useAuth();

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      loadMessages(selectedMatch.matchId);
    }
  }, [selectedMatch]);

  const loadMatches = async () => {
    try {
      const userId = getCurrentUserId();
      const allMatches = await matchAPI.getAll();
      const allUsers = await userAPI.getAll();

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

        return {
          ...match,
          otherUser,
        };
      });

      setMatches(enrichedMatches);
      if (enrichedMatches.length > 0 && !selectedMatch) {
        setSelectedMatch(enrichedMatches[0]);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (matchId) => {
    try {
      const allMessages = await messageAPI.getByMatch(matchId);
      setMessages(allMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      await messageAPI.create({
        match: { matchId: selectedMatch.matchId },
        sender: { userId: getCurrentUserId() },
        content: newMessage,
      });
      setNewMessage('');
      await loadMessages(selectedMatch.matchId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = (item.sender?.userId || item.sender?.id) === getCurrentUserId();
    return (
      <View style={[styles.message, isOwn ? styles.ownMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
          {item.content}
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

  if (matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No conversations yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.conversationsList}>
        <FlatList
          data={matches}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.conversationItem,
                selectedMatch?.matchId === item.matchId && styles.conversationItemActive,
              ]}
              onPress={() => setSelectedMatch(item)}
            >
              <View style={styles.conversationAvatar}>
                <Text style={styles.conversationAvatarText}>
                  {item.otherUser?.firstName?.[0]}{item.otherUser?.lastName?.[0]}
                </Text>
              </View>
              <Text style={styles.conversationName} numberOfLines={1}>
                {item.otherUser?.firstName}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.matchId?.toString()}
        />
      </View>

      {selectedMatch && (
        <KeyboardAvoidingView
          style={styles.messagesContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.messageId?.toString()}
            contentContainerStyle={styles.messagesList}
            inverted
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  conversationsList: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  conversationItem: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  conversationItemActive: {
    opacity: 1,
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conversationAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  conversationName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    maxWidth: 60,
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

