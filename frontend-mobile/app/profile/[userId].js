import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { userAPI, profileAPI, userSkillAPI, userInterestAPI, userOrganizationAPI, userLanguageAPI } from '../../src/services/api';
import { theme } from '../../src/styles/theme';

export default function ViewProfile() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const [users, profiles, userSkills, userInterests, userOrgs, userLangs] = await Promise.all([
        userAPI.getAll(),
        profileAPI.getAll(),
        userSkillAPI.getAll(),
        userInterestAPI.getAll(),
        userOrganizationAPI.getAll(),
        userLanguageAPI.getAll(),
      ]);

      const currentUser = users.find(u => u.userId === parseInt(userId));
      const currentProfile = profiles.find(p => p.user?.userId === parseInt(userId));

      setUser(currentUser);
      setProfile(currentProfile);
      setSkills(userSkills.filter(s => s.user?.userId === parseInt(userId)));
      setInterests(userInterests.filter(i => i.user?.userId === parseInt(userId)));
      setOrganizations(userOrgs.filter(o => o.user?.userId === parseInt(userId)));
      setLanguages(userLangs.filter(l => l.user?.userId === parseInt(userId)));
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        {profile?.major && (
          <Text style={styles.major}>{profile.major}</Text>
        )}
        {profile?.location && (
          <Text style={styles.location}>📍 {profile.location}</Text>
        )}
      </View>

      {profile?.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>{profile.bio}</Text>
        </View>
      )}

      {skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {skills.map(skill => (
            <View key={skill.skillId} style={styles.skillItem}>
              <Text style={styles.skillText}>
                {skill.skillName} - {skill.skillLevel}
              </Text>
            </View>
          ))}
        </View>
      )}

      {interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          {interests.map(interest => (
            <View key={interest.interestId} style={styles.interestItem}>
              <Text style={styles.interestText}>{interest.interestName}</Text>
            </View>
          ))}
        </View>
      )}

      {profile?.careerGoals && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Goals</Text>
          <Text style={styles.sectionText}>{profile.careerGoals}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  content: {
    padding: theme.spacing.lg,
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
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  major: {
    fontSize: 18,
    color: theme.colors.accentPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  location: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  section: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.borderColor,
    paddingBottom: theme.spacing.sm,
  },
  sectionText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  skillItem: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  skillText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  interestItem: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  interestText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});

