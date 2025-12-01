import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
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

  // Reset position when user changes
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
      <TouchableOpacity style={styles.viewProfileButton} onPress={onViewProfile}>
        <Text style={styles.viewProfileText}>View Full Profile →</Text>
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🎓</Text>
            <Text style={styles.detailText}>{user.university || 'University'}</Text>
          </View>
          {user.major ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📚</Text>
              <Text style={styles.detailText}>{user.major}</Text>
            </View>
          ) : null}
          {user.location ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText}>{user.location}</Text>
            </View>
          ) : null}
          {user.distance !== undefined && user.distance !== null ? (
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📏</Text>
              <Text style={styles.detailText}>
                {user.distance < 1
                  ? `${Math.round(user.distance * 1000)} m away`
                  : `${user.distance.toFixed(1)} km away`}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => onSwipe('left')}
          >
            <Text style={styles.actionIcon}>✕</Text>
            <Text style={styles.actionText}>PASS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => onSwipe('right')}
          >
            <Text style={styles.actionIcon}>❤️</Text>
            <Text style={styles.actionText}>LIKE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 32,
    minHeight: 600,
    maxHeight: 700,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  viewProfileButton: {
    alignSelf: 'flex-end',
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.accentPrimary,
  },
  viewProfileText: {
    color: theme.colors.accentPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
    minHeight: 150,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    gap: theme.spacing.md,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  details: {
    gap: theme.spacing.xs,
    marginVertical: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  detailIcon: {
    fontSize: 18,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
    flexWrap: 'wrap',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  passButton: {
    backgroundColor: theme.colors.bgSecondary,
    borderWidth: 2,
    borderColor: theme.colors.borderColor,
  },
  likeButton: {
    backgroundColor: theme.colors.accentPrimary,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

