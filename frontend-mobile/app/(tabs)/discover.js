import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { userAPI, profileAPI, swipeAPI, photoAPI, matchAPI } from '../../src/services/api';
import { theme } from '../../src/styles/theme';
import DiscoverCard from '../../src/components/DiscoverCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

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

      // Merge user and profile data and load photos
      const usersWithProfiles = await Promise.all(
        allUsers.map(async (user) => {
          const profile = allProfiles.find(p => p.user?.userId === user.userId);
          let photoUrl = null;
          
          // Load primary photo if profile exists
          if (profile?.profileId) {
            try {
              const photos = await photoAPI.getByProfile(profile.profileId);
              const primaryPhoto = photos.find(p => p.isPrimary) || photos[0];
              photoUrl = primaryPhoto?.photoUrl;
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

      let filteredUsers = usersWithProfiles.filter(
        user => user.userId !== currentUserId && !swipedUserIds.has(user.userId)
      );

      // Apply year filter
      if (filters.years.length > 0) {
        filteredUsers = filteredUsers.filter(user => {
          return user.profile && filters.years.includes(user.profile.year);
        });
      }

      // Calculate distances if current user has location
      const currentUser = allUsers.find(u => u.userId === currentUserId);
      const currentProfile = allProfiles.find(p => p.user?.userId === currentUserId);
      const currentLat = currentProfile?.latitude || currentUser?.latitude;
      const currentLon = currentProfile?.longitude || currentUser?.longitude;

      if (currentLat && currentLon) {
        filteredUsers.forEach(user => {
          if (user.latitude && user.longitude) {
            user.distance = calculateDistance(currentLat, currentLon, user.latitude, user.longitude);
          }
        });
      }

      // Apply location filter if enabled
      if (filters.locationEnabled && currentLat && currentLon) {
        filteredUsers = filteredUsers.filter(user => {
          if (!user.distance) return false;
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    const isLike = direction === 'right';
    const swiperId = getCurrentUserId();
    const swipeeId = currentUser.userId;

    // Validate IDs
    if (!swiperId || !swipeeId) {
      console.error('Invalid user IDs:', { swiperId, swipeeId });
      Alert.alert('Error', 'Invalid user information');
      return;
    }

    try {
      // Ensure userIds are numbers, not strings
      const swipeData = {
        swiper: { 
          userId: typeof swiperId === 'string' ? parseInt(swiperId, 10) : swiperId 
        },
        swipee: { 
          userId: typeof swipeeId === 'string' ? parseInt(swipeeId, 10) : swipeeId 
        },
        isLike: isLike,
      };

      // Validate the data before sending
      if (!swipeData.swiper.userId || !swipeData.swipee.userId) {
        throw new Error('Invalid user IDs in swipe data');
      }

      console.log('Sending swipe data:', JSON.stringify(swipeData, null, 2));
      const result = await swipeAPI.create(swipeData);
      console.log('Swipe successful:', result);

      // Remove the swiped user from the list
      const updatedUsers = users.filter((_, index) => index !== currentIndex);
      setUsers(updatedUsers);
      
      // Reset index to 0 to show the next card (which is now at index 0)
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error performing swipe:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        swipeData: { swiperId, swipeeId, isLike },
      });
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message 
        || error.response?.data 
        || error.message 
        || 'Failed to perform swipe. Please try again.';
      
      Alert.alert('Swipe Error', errorMessage);
    }
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
        <Text style={styles.emptyTitle}>No more users!</Text>
        <Text style={styles.emptyText}>Check back later for new profiles.</Text>
      </View>
    );
  }

  const currentUser = users[currentIndex];

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

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <Text style={styles.filterButtonText}>🔍 Filters</Text>
      </TouchableOpacity>

      {/* Card */}
      <View style={styles.cardContainer}>
        <DiscoverCard
          key={`${currentUser.userId}-${currentIndex}`}
          user={currentUser}
          onSwipe={handleSwipe}
          onViewProfile={() => router.push(`/profile/${currentUser.userId}`)}
        />
      </View>

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
              {/* Year Filter */}
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

              {/* Location Filter */}
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

              {/* Stats Section */}
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>YOUR STATS</Text>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Matches</Text>
                  <Text style={styles.statValue}>{stats.totalMatches}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Active Chats</Text>
                  <Text style={styles.statValue}>{stats.activeChats}</Text>
                </View>
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
  filterButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    zIndex: 1000,
    elevation: 10, // Android shadow/elevation
    backgroundColor: theme.colors.accentPrimary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 70,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  filterContainer: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  filterPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterPill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.bgSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  filterPillActive: {
    backgroundColor: theme.colors.accentPrimary,
    borderColor: theme.colors.accentPrimary,
  },
  filterPillText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    paddingTop: 50, // Reduced padding to fit better with smaller filter button
    paddingHorizontal: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  modalContent: {
    backgroundColor: theme.colors.bgCard,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    minHeight: 200,
    width: '100%',
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
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
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
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
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
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  distanceContainer: {
    marginTop: theme.spacing.md,
  },
  distanceLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    fontWeight: '500',
  },
  distanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  distanceButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.bgSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  distanceButtonActive: {
    backgroundColor: theme.colors.accentPrimary,
    borderColor: theme.colors.accentPrimary,
  },
  distanceButtonText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  distanceButtonTextActive: {
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
    backgroundColor: theme.colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statsSection: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderColor,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderColor,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: theme.colors.accentPrimary,
    fontWeight: '700',
  },
});

