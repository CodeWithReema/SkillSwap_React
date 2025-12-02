import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useNotifications } from '../../src/contexts/NotificationContext';
import { matchAPI, userAPI, profileAPI, photoAPI } from '../../src/services/api';
import { theme } from '../../src/styles/theme';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getCurrentUserId } = useAuth();
  const { clearMatchNotifications } = useNotifications();
  const router = useRouter();

  // Clear notifications when tab comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (clearMatchNotifications) {
        clearMatchNotifications();
      }
    }, [clearMatchNotifications])
  );

  useEffect(() => {
    // Only show loading on initial mount
    const initialLoad = async () => {
      setLoading(true);
      await loadMatches();
      setLoading(false);
    };
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMatches = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (loading) {
        // Only set loading on initial load
        setLoading(true);
      }
      
      const userId = getCurrentUserId();
      const [allMatches, allUsers, allProfiles] = await Promise.all([
        matchAPI.getAll(),
        userAPI.getAll(),
        profileAPI.getAll(),
      ]);

      const userMatches = allMatches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });

      // Enrich matches with user data and photos
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

          return {
            ...match,
            otherUser,
            photoUrl,
          };
        })
      );

      // Filter out matches where otherUser is null (user might have been deleted)
      const validMatches = enrichedMatches.filter(match => match.otherUser != null);

      setMatches(validMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadMatches(true);
  };

  const renderMatch = ({ item }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => router.push(`/profile/${item.otherUser?.userId}`)}
    >
      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.otherUser?.firstName?.[0]}{item.otherUser?.lastName?.[0]}
          </Text>
        </View>
      )}
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>
          {item.otherUser?.firstName} {item.otherUser?.lastName}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => router.push('/(tabs)/messages')}
      >
        <Text style={styles.messageButtonText}>Message</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      <Text style={styles.subtitle}>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</Text>
      
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.matchId?.toString()}
        contentContainerStyle={matches.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matches yet</Text>
            <Text style={styles.emptySubtext}>Start swiping to find your skill exchange partners!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  listContent: {
    gap: theme.spacing.md,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    gap: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: theme.colors.accentPrimary,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  messageButton: {
    backgroundColor: theme.colors.accentPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  messageButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
});

