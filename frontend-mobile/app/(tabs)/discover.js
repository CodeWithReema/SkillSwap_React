import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { userAPI, profileAPI, swipeAPI } from '../../src/services/api';
import { theme } from '../../src/styles/theme';
import DiscoverCard from '../../src/components/DiscoverCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

export default function Discover() {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { getCurrentUserId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const currentUserId = getCurrentUserId();
      const [allUsers, allProfiles, swipes] = await Promise.all([
        userAPI.getAll(),
        profileAPI.getAll(),
        swipeAPI.getByUser(currentUserId),
      ]);

      const swipedUserIds = new Set(swipes.map(s => s.swipee?.userId || s.swipee?.id));

      // Merge user and profile data
      const usersWithProfiles = allUsers.map(user => {
        const profile = allProfiles.find(p => p.user?.userId === user.userId);
        return {
          ...user,
          profile: profile,
          major: profile?.major || '',
          location: profile?.location || user.location || '',
          latitude: profile?.latitude || user.latitude,
          longitude: profile?.longitude || user.longitude,
        };
      });

      const filteredUsers = usersWithProfiles.filter(
        user => user.userId !== currentUserId && !swipedUserIds.has(user.userId)
      );

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

  return (
    <View style={styles.container}>
      <DiscoverCard
        key={`${currentUser.userId}-${currentIndex}`}
        user={currentUser}
        onSwipe={handleSwipe}
        onViewProfile={() => router.push(`/profile/${currentUser.userId}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
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
});

