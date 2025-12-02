import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { theme } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

export default function DiscoverCard({ user, onSwipe, onViewProfile }) {
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const rotate = position.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [user.userId, position]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
          const direction = gestureState.dx > 0 ? 'right' : 'left';
          Animated.timing(position, {
            toValue: { x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, y: gestureState.dy },
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            onSwipe(direction);
            position.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
  };

  return (
    <Animated.View
      style={[styles.card, cardStyle]}
      {...panResponder.panHandlers}
    >
      {/* Gradient Header Section - Unique Design */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.viewProfileButton} onPress={onViewProfile}>
            <Text style={styles.viewProfileText}>View Profile →</Text>
          </TouchableOpacity>
          
          <View style={styles.avatarContainer}>
            {user.photoUrl ? (
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: user.photoUrl }}
                  style={styles.avatarImage}
                />
                <View style={styles.avatarGlow} />
              </View>
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconContainer}>
              <Text style={styles.detailIcon}>🎓</Text>
            </View>
            <Text style={styles.detailText}>{user.university || 'University'}</Text>
          </View>
          {user.major && (
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>📚</Text>
              </View>
              <Text style={styles.detailText}>{user.major}</Text>
            </View>
          )}
          {user.location && (
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>📍</Text>
              </View>
              <Text style={styles.detailText}>{user.location}</Text>
            </View>
          )}
          {user.distance !== undefined && user.distance !== null && (
            <View style={[styles.detailItem, styles.distanceItem]}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>📏</Text>
              </View>
              <Text style={styles.distanceText}>
                {user.distance < 1
                  ? `${Math.round(user.distance * 1000)} m away`
                  : `${user.distance.toFixed(1)} km away`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => onSwipe('left')}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.passIcon}>✕</Text>
              <Text style={styles.passButtonText}>PASS</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => onSwipe('right')}
          >
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionIcon}>❤️</Text>
              <Text style={styles.actionText}>LIKE</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 32,
    minHeight: 450, // Further reduced to leave room for buttons
    maxHeight: 520, // Further reduced max height
    backgroundColor: theme.colors.bgPrimary, // Solid background for visibility
    borderRadius: theme.borderRadius.xxxl,
    overflow: 'hidden',
    ...theme.shadows.glass,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  headerGradient: {
    height: 220, // Reduced height
    backgroundColor: theme.colors.accentPrimary,
    paddingTop: theme.spacing.lg,
    position: 'relative',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileButton: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewProfileText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 140, // Reduced size
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -10,
    left: -10,
  },
  avatar: {
    width: 140, // Reduced size
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarText: {
    fontSize: 44, // Reduced to match smaller avatar
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: theme.spacing.md, // Reduced padding
    gap: theme.spacing.sm, // Reduced gap
    backgroundColor: theme.colors.bgPrimary, // Solid background for content visibility
  },
  name: {
    fontSize: 28, // Reduced font size
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginTop: theme.spacing.xs, // Reduced margin
  },
  details: {
    gap: theme.spacing.sm, // Reduced gap
    marginVertical: theme.spacing.sm, // Reduced margin
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.xl,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailIcon: {
    fontSize: 18,
  },
  detailText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  distanceItem: {
    backgroundColor: theme.colors.accentPrimary + '20',
    borderWidth: 1,
    borderColor: theme.colors.accentPrimary,
  },
  distanceText: {
    fontSize: 16,
    color: theme.colors.accentPrimary,
    flex: 1,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  passButton: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 3,
    borderColor: theme.colors.accentDanger, // More noticeable red border
  },
  likeButton: {
    backgroundColor: theme.colors.accentPrimary,
    ...theme.shadows.glow,
  },
  actionIcon: {
    fontSize: 28,
  },
  passIcon: {
    fontSize: 28,
    color: theme.colors.accentDanger, // Red icon for pass button
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  passButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.accentDanger, // Red text for more visibility
  },
});
