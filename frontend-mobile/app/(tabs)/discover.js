import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { useNotifications } from '../../src/contexts/NotificationContext';
import api, { userAPI, profileAPI, swipeAPI, photoAPI, matchAPI } from '../../src/services/api';
import { theme } from '../../src/styles/theme';
import DiscoverCard from '../../src/components/DiscoverCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Discover() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    years: [],
    locationEnabled: false,
    maxDistance: 50,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeChats: 0,
  });
  const { getCurrentUserId } = useAuth();
  const { checkNotificationsImmediately } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [filters]);

  const loadStats = async () => {
    try {
      const matches = await matchAPI.getAll();
      const userId = getCurrentUserId();
      const userMatches = matches.filter(match => {
        const user1Id = match.user1?.userId || match.user1?.id;
        const user2Id = match.user2?.userId || match.user2?.id;
        return user1Id === userId || user2Id === userId;
      });
      setStats({
        totalMatches: userMatches.length,
        activeChats: userMatches.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

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

  const loadUsers = async () => {
    try {
      setLoading(true);
      const currentUserId = getCurrentUserId();
      const [allUsers, allProfiles, swipes] = await Promise.all([
        userAPI.getAll(),
        profileAPI.getAll(),
        swipeAPI.getByUser(currentUserId),
      ]);

      const swipedUserIds = new Set(swipes.map(s => s.swipee?.userId || s.swipee?.id));

      const usersWithProfiles = await Promise.all(
        allUsers.map(async (user) => {
          const profile = allProfiles.find(p => p.user?.userId === user.userId);
          let photoUrl = null;
          
          if (profile?.profileId) {
            try {
              const photos = await photoAPI.getByProfile(profile.profileId);
              const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
              photoUrl = primaryPhoto?.photoUrl ? toAbsoluteUrl(primaryPhoto.photoUrl) : null;
            } catch (error) {
              console.error(`Error loading photo for user ${user.userId}:`, error);
            }
          }
          
          return {
            ...user,
            profile: profile,
            major: profile?.major || '',
            location: profile?.location || user.location || '',
            latitude: profile?.latitude || user.latitude,
            longitude: profile?.longitude || user.longitude,
            photoUrl: photoUrl,
          };
        })
      );

      let filteredUsers = usersWithProfiles.filter(user => 
        user.userId !== currentUserId && !swipedUserIds.has(user.userId)
      );

      const currentUser = allUsers.find(u => u.userId === currentUserId);
      const currentProfile = allProfiles.find(p => p.user?.userId === currentUserId);
      const currentLat = currentProfile?.latitude || currentUser?.latitude;
      const currentLon = currentProfile?.longitude || currentUser?.longitude;

      if (currentLat && currentLon) {
        filteredUsers.forEach(user => {
          if (user.latitude && user.longitude) {
            const R = 6371;
            const dLat = (user.latitude - currentLat) * Math.PI / 180;
            const dLon = (user.longitude - currentLon) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(currentLat * Math.PI / 180) * Math.cos(user.latitude * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            user.distance = R * c;
          }
        });
      }

      if (filters.years.length > 0) {
        filteredUsers = filteredUsers.filter(user => {
          return user.profile && filters.years.includes(user.profile.year);
        });
      }

      if (filters.locationEnabled) {
        filteredUsers = filteredUsers.filter(user => {
          if (!user.latitude || !user.longitude) return false;
          return user.distance <= filters.maxDistance;
        });
      }

      setUsers(filteredUsers);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    const isLike = direction === 'right';

    try {
      await swipeAPI.create({
        swiper: { userId: getCurrentUserId() },
        swipee: { userId: currentUser.userId },
        isLike,
      });

      if (isLike) {
        setTimeout(() => {
          loadStats();
          // Immediately check for new matches after a successful like
          checkNotificationsImmediately();
        }, 500);
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error performing swipe:', error);
      Alert.alert('Error', 'Failed to perform swipe. Please try again.');
    }
  };

  const toggleYearFilter = (year) => {
    setFilters(prev => ({
      ...prev,
      years: prev.years.includes(year)
        ? prev.years.filter(y => y !== year)
        : [...prev.years, year],
    }));
  };

  const toggleLocationFilter = () => {
    setFilters(prev => ({
      ...prev,
      locationEnabled: !prev.locationEnabled,
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✨</Text>
        <Text style={styles.emptyTitle}>No more users!</Text>
        <Text style={styles.emptyText}>Check back later for new profiles.</Text>
        
        {/* Navigation Buttons - Only shown when no more cards */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/(tabs)/matches')}
          >
            <Text style={styles.navButtonIcon}>💫</Text>
            <Text style={styles.navButtonText}>View Matches</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Text style={styles.navButtonIcon}>💬</Text>
            <Text style={styles.navButtonText}>Messages</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];
  const thirdUser = users[currentIndex + 2];

  return (
    <View style={styles.container}>
      {/* Floating Stats Pills - Top */}
      <View style={styles.statsContainer}>
        <View style={styles.statPill}>
          <Text style={styles.statIcon}>💫</Text>
          <Text style={styles.statValue}>{stats.totalMatches}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statIcon}>💬</Text>
          <Text style={styles.statValue}>{stats.activeChats}</Text>
          <Text style={styles.statLabel}>Chats</Text>
        </View>
      </View>

      {/* Overlapping Card Stack - Unique Layout */}
      <View style={styles.cardStackContainer}>
        {/* Third Card (Back) */}
        {thirdUser && (
          <View style={[styles.cardStack, styles.cardStackBack]}>
            <View style={styles.cardStackContent}>
              <View style={styles.cardStackAvatar}>
                {thirdUser.photoUrl ? (
                  <Image source={{ uri: thirdUser.photoUrl }} style={styles.cardStackAvatarImage} />
                ) : (
                  <View style={styles.cardStackAvatarPlaceholder}>
                    <Text style={styles.cardStackAvatarText}>
                      {thirdUser.firstName?.[0]}{thirdUser.lastName?.[0]}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Second Card (Middle) */}
        {nextUser && (
          <View style={[styles.cardStack, styles.cardStackMiddle]}>
            <View style={styles.cardStackContent}>
              <View style={styles.cardStackAvatar}>
                {nextUser.photoUrl ? (
                  <Image source={{ uri: nextUser.photoUrl }} style={styles.cardStackAvatarImage} />
                ) : (
                  <View style={styles.cardStackAvatarPlaceholder}>
                    <Text style={styles.cardStackAvatarText}>
                      {nextUser.firstName?.[0]}{nextUser.lastName?.[0]}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Main Card (Front) */}
        <View style={styles.cardStackFront}>
          <DiscoverCard
            key={`${currentUser.userId}-${currentIndex}`}
            user={currentUser}
            onSwipe={handleSwipe}
            onViewProfile={() => router.push(`/profile/${currentUser.userId}`)}
          />
        </View>
      </View>

      {/* Filter Button - Floating */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <Text style={styles.filterButtonIcon}>🔍</Text>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilters(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Year</Text>
                <View style={styles.filterPills}>
                  {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Faculty'].map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.filterPill,
                        filters.years.includes(year) && styles.filterPillActive
                      ]}
                      onPress={() => toggleYearFilter(year)}
                    >
                      <Text style={[
                        styles.filterPillText,
                        filters.years.includes(year) && styles.filterPillTextActive
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                  <View style={styles.filterRowContent}>
                    <Text style={styles.filterSectionTitle}>Location</Text>
                    <Text style={styles.filterDescription}>
                      Show nearby users only
                    </Text>
                  </View>
                  <Switch
                    value={filters.locationEnabled}
                    onValueChange={toggleLocationFilter}
                    trackColor={{ false: theme.colors.bgSecondary, true: theme.colors.accentPrimary }}
                    thumbColor={filters.locationEnabled ? '#fff' : theme.colors.textSecondary}
                  />
                </View>
                {filters.locationEnabled && (
                  <View style={styles.distanceContainer}>
                    <Text style={styles.distanceLabel}>
                      Max distance: {filters.maxDistance} km
                    </Text>
                    <View style={styles.distanceButtons}>
                      {[5, 10, 25, 50, 100, 200].map(distance => (
                        <TouchableOpacity
                          key={distance}
                          style={[
                            styles.distanceButton,
                            filters.maxDistance === distance && styles.distanceButtonActive
                          ]}
                          onPress={() => setFilters(prev => ({ ...prev, maxDistance: distance }))}
                        >
                          <Text style={[
                            styles.distanceButtonText,
                            filters.maxDistance === distance && styles.distanceButtonTextActive
                          ]}>
                            {distance} km
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bgPrimary,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.bgPrimary, // Match general dark background
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    zIndex: 10,
    paddingHorizontal: theme.spacing.md,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xxxl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    ...theme.shadows.glass,
    gap: theme.spacing.xs,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.accentPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  cardStackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 120, // Reduced since no navigation buttons when cards available
    paddingHorizontal: theme.spacing.md, // Added horizontal padding
  },
  cardStack: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: theme.borderRadius.xxxl,
    overflow: 'hidden',
  },
  cardStackBack: {
    backgroundColor: theme.colors.bgPrimary, // Solid background to prevent transparency
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    transform: [{ scale: 0.85 }, { translateY: 40 }],
    opacity: 0.3, // More transparent so it doesn't interfere
    zIndex: 1,
  },
  cardStackMiddle: {
    backgroundColor: theme.colors.bgPrimary, // Solid background to prevent transparency
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    transform: [{ scale: 0.92 }, { translateY: 20 }],
    opacity: 0.5, // More transparent so it doesn't interfere
    zIndex: 2,
  },
  cardStackFront: {
    zIndex: 3,
  },
  cardStackContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStackAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  cardStackAvatarImage: {
    width: '100%',
    height: '100%',
  },
  cardStackAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStackAvatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  filterButton: {
    position: 'absolute',
    bottom: 100,
    right: theme.spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.glow,
    zIndex: 100,
  },
  filterButtonIcon: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(10, 10, 21, 0.92)', // Translucent dark background matching app bgPrimary (#0a0a15)
    borderTopLeftRadius: theme.borderRadius.xxxl,
    borderTopRightRadius: theme.borderRadius.xxxl,
    maxHeight: '80%',
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  modalScrollView: {
    flexGrow: 1,
  },
  filterSection: {
    marginBottom: theme.spacing.xl,
  },
  filterSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  filterPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md, // Increased spacing
    marginBottom: theme.spacing.sm,
  },
  filterPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.bgSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  filterPillActive: {
    backgroundColor: theme.colors.accentPrimary,
    borderColor: theme.colors.accentPrimary,
  },
  filterPillText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  filterRowContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  filterDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  distanceContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
  },
  distanceLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  distanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md, // Increased spacing
    marginTop: theme.spacing.sm,
  },
  distanceButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  distanceButtonActive: {
    backgroundColor: theme.colors.accentPrimary,
    borderColor: theme.colors.accentPrimary,
  },
  distanceButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  distanceButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  navButton: {
    flex: 1,
    backgroundColor: theme.colors.accentPrimary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.glow,
  },
  navButtonIcon: {
    fontSize: 32,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
