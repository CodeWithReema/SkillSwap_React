import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useNotifications } from '../../src/contexts/NotificationContext';
import api, { matchAPI, userAPI, profileAPI, photoAPI } from '../../src/services/api';
import { theme } from '../../src/styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with gaps

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getCurrentUserId } = useAuth();
  const { clearMatchNotifications } = useNotifications();
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      if (clearMatchNotifications) {
        clearMatchNotifications();
      }
    }, [clearMatchNotifications])
  );

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadMatches();
      setLoading(false);
    };
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert relative photo URLs to absolute URLs
  const toAbsoluteUrl = (url) => {
    if (!url) return null;
    try {
      // If already absolute URL, return as-is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // Get API base URL from axios instance
      const baseURL = api.defaults?.baseURL || 'http://localhost:8080';
      return url.startsWith('/') ? `${baseURL}${url}` : `${baseURL}/${url}`;
    } catch (e) {
      console.error('Error converting photo URL:', e, url);
      return url;
    }
  };

  const loadMatches = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (loading) {
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

      const enrichedMatches = await Promise.all(
        userMatches.map(async (match) => {
          const user1Id = match.user1?.userId || match.user1?.id;
          const user2Id = match.user2?.userId || match.user2?.id;
          const otherUserId = user1Id === userId ? user2Id : user1Id;
          const otherUser = allUsers.find(u => u.userId === otherUserId);
          const otherProfile = allProfiles.find(p => p.user?.userId === otherUserId);
          
          let photoUrl = null;
          if (otherProfile?.profileId) {
            try {
              const photos = await photoAPI.getByProfile(otherProfile.profileId);
              const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
              photoUrl = primaryPhoto?.photoUrl ? toAbsoluteUrl(primaryPhoto.photoUrl) : null;
            } catch (error) {
              console.error(`Error loading photo for user ${otherUserId}:`, error);
            }
          }

          return {
            ...match,
            otherUser,
            otherProfile,
            photoUrl,
          };
        })
      );

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

  const renderMatch = ({ item, index }) => {
    // Staggered layout - alternate heights and positions
    const isEven = index % 2 === 0;
    const cardHeight = isEven ? 280 : 320;
    const rotation = isEven ? -1.5 : 1.5;
    
    return (
      <TouchableOpacity
        style={[
          styles.matchCard,
          { 
            height: cardHeight,
            transform: [{ rotate: `${rotation}deg` }],
            marginTop: isEven ? 0 : 20, // Staggered positioning
          }
        ]}
        onPress={() => router.push(`/profile/${item.otherUser?.userId}`)}
        activeOpacity={0.9}
      >
        {/* Hexagonal Top Section */}
        <View style={styles.cardTop}>
          <View style={styles.hexagonContainer}>
            {item.photoUrl ? (
              <Image source={{ uri: item.photoUrl }} style={styles.hexagonImage} />
            ) : (
              <View style={styles.hexagonPlaceholder}>
                <Text style={styles.hexagonText}>
                  {item.otherUser?.firstName?.[0]}{item.otherUser?.lastName?.[0]}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.cardContent}>
          <Text style={styles.matchName} numberOfLines={1}>
            {item.otherUser?.firstName} {item.otherUser?.lastName}
          </Text>
          {item.otherProfile?.major && (
            <Text style={styles.matchMajor} numberOfLines={1}>
              {item.otherProfile.major}
            </Text>
          )}
          {item.otherProfile?.bio && (
            <Text style={styles.matchBio} numberOfLines={2}>
              {item.otherProfile.bio}
            </Text>
          )}
        </View>

        {/* Action Buttons - Bottom */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/profile/${item.otherUser?.userId}`)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Text style={styles.messageButtonText}>💬</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
        <Text style={styles.subtitle}>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</Text>
      </View>
      
      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.matchId?.toString()}
        contentContainerStyle={matches.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💫</Text>
            <Text style={styles.emptyText}>No matches yet</Text>
            <Text style={styles.emptySubtext}>Start swiping to find your skill exchange partners!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  matchCard: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xxxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    ...theme.shadows.glass,
  },
  cardTop: {
    height: 140,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hexagonContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagonImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  hexagonPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  hexagonText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  cardContent: {
    padding: theme.spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  matchName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  matchMajor: {
    fontSize: 14,
    color: theme.colors.accentPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  matchBio: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
  },
  viewButton: {
    flex: 1,
    backgroundColor: theme.colors.bgSecondary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  viewButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  messageButton: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.accentPrimary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.glass,
  },
  messageButtonText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
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
