import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  userAPI,
  profileAPI,
  userSkillAPI,
  userInterestAPI,
  userOrganizationAPI,
  userLanguageAPI,
  photoAPI,
} from '../../src/services/api';
import { theme } from '../../src/styles/theme';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export default function Profile() {
  const { getCurrentUserId, updateUser, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    major: '',
    year: '',
    location: '',
    careerGoals: '',
    availability: '',
    career: '',
    careerExperience: '',
    researchPublications: '',
    awards: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });
  const [photos, setPhotos] = useState([]);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  
  // Add item modals
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddInterest, setShowAddInterest] = useState(false);
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  
  // New item states
  const [newSkill, setNewSkill] = useState({ skillName: '', skillLevel: 'Intermediate', offering: false, seeking: false });
  const [newInterest, setNewInterest] = useState({ interestName: '', category: '' });
  const [newOrg, setNewOrg] = useState({ organizationName: '', role: '' });
  const [newLanguage, setNewLanguage] = useState({ languageName: '', proficiencyLevel: 'Native' });
  
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userId = getCurrentUserId();
      const [users, profiles, userSkills, userInterests, userOrgs, userLangs] = await Promise.all([
        userAPI.getAll(),
        profileAPI.getAll(),
        userSkillAPI.getAll(),
        userInterestAPI.getAll(),
        userOrganizationAPI.getAll(),
        userLanguageAPI.getAll(),
      ]);

      const currentUser = users.find(u => u.userId === userId);
      const profile = profiles.find(p => p.user?.userId === userId);
      setCurrentProfile(profile);

      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
        }));
      }

      if (profile) {
        setFormData(prev => ({
          ...prev,
          bio: profile.bio || '',
          major: profile.major || '',
          year: profile.year || '',
          location: profile.location || '',
          careerGoals: profile.careerGoals || '',
          availability: profile.availability || '',
          career: profile.career || '',
          careerExperience: profile.careerExperience || '',
          researchPublications: profile.researchPublications || '',
          awards: profile.awards || '',
          linkedin: profile.linkedin || '',
          github: profile.github || '',
          portfolio: profile.portfolio || '',
        }));
        
        // Load photos
        if (profile.profileId) {
          try {
            const profilePhotos = await photoAPI.getByProfile(profile.profileId);
            setPhotos(profilePhotos || []);
          } catch (error) {
            console.error('Error loading photos:', error);
            setPhotos([]);
          }
        }
      }

      setSkills(userSkills.filter(s => s.user?.userId === userId));
      setInterests(userInterests.filter(i => i.user?.userId === userId));
      setOrganizations(userOrgs.filter(o => o.user?.userId === userId));
      setLanguages(userLangs.filter(l => l.user?.userId === userId));
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = getCurrentUserId();
      const updatedUser = await userAPI.update(userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      updateUser(updatedUser);

      const profileData = {
        user: updatedUser,
        ...formData,
      };

      if (currentProfile?.profileId) {
        await profileAPI.update(currentProfile.profileId, profileData);
      } else {
        const newProfile = await profileAPI.create(profileData);
        setCurrentProfile(newProfile);
      }

      Alert.alert('Success', 'Profile saved successfully!');
      await loadProfile();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Photo upload
  const handlePhotoUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Ensure profile exists before uploading
        let profileId = currentProfile?.profileId;
        
        if (!profileId) {
          // Create profile if it doesn't exist
          const userId = getCurrentUserId();
          const user = await userAPI.getById(userId);
          const profileData = {
            user: user,
            ...formData,
          };
          const newProfile = await profileAPI.create(profileData);
          profileId = newProfile.profileId;
          setCurrentProfile(newProfile);
        }

        const formDataToSend = new FormData();
        // React Native FormData format - must match backend expectations
        formDataToSend.append('file', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
        formDataToSend.append('profileId', profileId.toString());
        // Backend expects boolean, but FormData converts to string
        formDataToSend.append('isPrimary', photos.length === 0 ? 'true' : 'false');

        console.log('Uploading photo:', {
          profileId,
          uri: result.assets[0].uri,
          isPrimary: photos.length === 0,
        });

        try {
          const response = await photoAPI.upload(formDataToSend);
          console.log('Photo upload response:', response);
          Alert.alert('Success', 'Photo uploaded successfully!');
          await loadProfile();
        } catch (uploadError) {
          console.error('Photo upload error:', uploadError);
          console.error('Error details:', {
            message: uploadError.message,
            response: uploadError.response?.data,
            status: uploadError.response?.status,
            request: uploadError.config,
          });
          Alert.alert(
            'Upload Error',
            uploadError.response?.data?.message || uploadError.message || 'Failed to upload photo. Please try again.'
          );
        }
      } else if (!currentProfile?.profileId) {
        Alert.alert('Error', 'Please save your profile first before uploading photos.');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo');
    }
  };

  // Precise location
  const usePreciseLocation = async () => {
    try {
      setLocationStatus('Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('Location permission denied');
        Alert.alert('Permission needed', 'Please grant location permissions to use precise location.');
        return;
      }

      setLocationStatus('Getting location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locationString = address 
        ? `${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim()
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setFormData(prev => ({ ...prev, location: locationString }));

      // Save location to profile
      if (currentProfile?.profileId) {
        await profileAPI.updateLocation(currentProfile.profileId, {
          latitude,
          longitude,
          location: locationString,
        });
        setLocationStatus('Location saved successfully!');
        setTimeout(() => setLocationStatus(''), 3000);
      } else {
        setLocationStatus('Save profile first to save location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationStatus('Error getting location');
      Alert.alert('Error', 'Failed to get location');
    }
  };

  // Skills management
  const addSkill = async () => {
    if (!newSkill.skillName.trim()) {
      Alert.alert('Error', 'Please enter a skill name');
      return;
    }
    try {
      await userSkillAPI.create({
        user: { userId: getCurrentUserId() },
        ...newSkill,
      });
      await loadProfile();
      setNewSkill({ skillName: '', skillLevel: 'Intermediate', offering: false, seeking: false });
      setShowAddSkill(false);
      Alert.alert('Success', 'Skill added!');
    } catch (error) {
      console.error('Error adding skill:', error);
      Alert.alert('Error', 'Failed to add skill');
    }
  };

  const deleteSkill = async (skillId) => {
    Alert.alert('Delete Skill', 'Are you sure you want to delete this skill?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await userSkillAPI.delete(skillId);
            await loadProfile();
          } catch (error) {
            console.error('Error deleting skill:', error);
            Alert.alert('Error', 'Failed to delete skill');
          }
        },
      },
    ]);
  };

  // Interests management
  const addInterest = async () => {
    if (!newInterest.interestName.trim()) {
      Alert.alert('Error', 'Please enter an interest name');
      return;
    }
    try {
      await userInterestAPI.create({
        user: { userId: getCurrentUserId() },
        ...newInterest,
      });
      await loadProfile();
      setNewInterest({ interestName: '', category: '' });
      setShowAddInterest(false);
      Alert.alert('Success', 'Interest added!');
    } catch (error) {
      console.error('Error adding interest:', error);
      Alert.alert('Error', 'Failed to add interest');
    }
  };

  const deleteInterest = async (interestId) => {
    Alert.alert('Delete Interest', 'Are you sure you want to delete this interest?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await userInterestAPI.delete(interestId);
            await loadProfile();
          } catch (error) {
            console.error('Error deleting interest:', error);
            Alert.alert('Error', 'Failed to delete interest');
          }
        },
      },
    ]);
  };

  // Organizations management
  const addOrganization = async () => {
    if (!newOrg.organizationName.trim()) {
      Alert.alert('Error', 'Please enter an organization name');
      return;
    }
    try {
      await userOrganizationAPI.create({
        user: { userId: getCurrentUserId() },
        ...newOrg,
      });
      await loadProfile();
      setNewOrg({ organizationName: '', role: '' });
      setShowAddOrg(false);
      Alert.alert('Success', 'Organization added!');
    } catch (error) {
      console.error('Error adding organization:', error);
      Alert.alert('Error', 'Failed to add organization');
    }
  };

  const deleteOrganization = async (orgId) => {
    Alert.alert('Delete Organization', 'Are you sure you want to delete this organization?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await userOrganizationAPI.delete(orgId);
            await loadProfile();
          } catch (error) {
            console.error('Error deleting organization:', error);
            Alert.alert('Error', 'Failed to delete organization');
          }
        },
      },
    ]);
  };

  // Languages management
  const addLanguage = async () => {
    if (!newLanguage.languageName.trim()) {
      Alert.alert('Error', 'Please enter a language name');
      return;
    }
    try {
      await userLanguageAPI.create({
        user: { userId: getCurrentUserId() },
        ...newLanguage,
      });
      await loadProfile();
      setNewLanguage({ languageName: '', proficiencyLevel: 'Native' });
      setShowAddLanguage(false);
      Alert.alert('Success', 'Language added!');
    } catch (error) {
      console.error('Error adding language:', error);
      Alert.alert('Error', 'Failed to add language');
    }
  };

  const deleteLanguage = async (languageId) => {
    Alert.alert('Delete Language', 'Are you sure you want to delete this language?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await userLanguageAPI.delete(languageId);
            await loadProfile();
          } catch (error) {
            console.error('Error deleting language:', error);
            Alert.alert('Error', 'Failed to delete language');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
                placeholder="First name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
                placeholder="Last name"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => setFormData(prev => ({ ...prev, bio: value }))}
              placeholder="Tell us about yourself..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Major</Text>
              <TextInput
                style={styles.input}
                value={formData.major}
                onChangeText={(value) => setFormData(prev => ({ ...prev, major: value }))}
                placeholder="e.g., Computer Science"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                value={formData.year}
                onChangeText={(value) => setFormData(prev => ({ ...prev, year: value }))}
                placeholder="e.g., Senior"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={formData.location}
                onChangeText={(value) => setFormData(prev => ({ ...prev, location: value }))}
                placeholder="City, State"
                placeholderTextColor={theme.colors.textMuted}
              />
              <TouchableOpacity
                style={styles.locationButton}
                onPress={usePreciseLocation}
              >
                <Text style={styles.locationButtonText}>📍</Text>
              </TouchableOpacity>
            </View>
            {locationStatus ? (
              <Text style={styles.locationStatus}>{locationStatus}</Text>
            ) : null}
          </View>
        </View>

        {/* Profile Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photos</Text>
          <View style={styles.photoSection}>
            {photos.length > 0 && photos[0]?.photoUrl ? (
              <Image
                source={{ uri: photos[0].photoUrl }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {formData.firstName?.[0] || 'U'}{formData.lastName?.[0] || ''}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePhotoUpload}
            >
              <Text style={styles.uploadButtonText}>📷 Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddSkill(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {skills.length > 0 ? (
            <View style={styles.itemsList}>
              {skills.map((skill) => (
                <View key={skill.userSkillId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{skill.skillName}</Text>
                    <Text style={styles.itemDetail}>
                      {skill.skillLevel} • {skill.offering ? 'Offering' : ''} {skill.seeking ? 'Seeking' : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteSkill(skill.userSkillId)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No skills added yet</Text>
          )}
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddInterest(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {interests.length > 0 ? (
            <View style={styles.itemsList}>
              {interests.map((interest) => (
                <View key={interest.userInterestId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{interest.interestName}</Text>
                    {interest.category ? (
                      <Text style={styles.itemDetail}>{interest.category}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteInterest(interest.userInterestId)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No interests added yet</Text>
          )}
        </View>

        {/* Organizations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Organizations</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddOrg(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {organizations.length > 0 ? (
            <View style={styles.itemsList}>
              {organizations.map((org) => (
                <View key={org.userOrganizationId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{org.organizationName}</Text>
                    {org.role ? (
                      <Text style={styles.itemDetail}>{org.role}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteOrganization(org.userOrganizationId)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No organizations added yet</Text>
          )}
        </View>

        {/* Languages Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddLanguage(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {languages.length > 0 ? (
            <View style={styles.itemsList}>
              {languages.map((lang) => (
                <View key={lang.userLanguageId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{lang.languageName}</Text>
                    <Text style={styles.itemDetail}>{lang.proficiencyLevel}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteLanguage(lang.userLanguageId)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No languages added yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Career Goals</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.careerGoals}
              onChangeText={(value) => setFormData(prev => ({ ...prev, careerGoals: value }))}
              placeholder="What are your career aspirations?"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Career/Job Title</Text>
            <TextInput
              style={styles.input}
              value={formData.career}
              onChangeText={(value) => setFormData(prev => ({ ...prev, career: value }))}
              placeholder="e.g., Software Engineer"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Career Experience</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.careerExperience}
              onChangeText={(value) => setFormData(prev => ({ ...prev, careerExperience: value }))}
              placeholder="Describe your work experience..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>LinkedIn</Text>
            <TextInput
              style={styles.input}
              value={formData.linkedin}
              onChangeText={(value) => setFormData(prev => ({ ...prev, linkedin: value }))}
              placeholder="https://linkedin.com/in/yourprofile"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>GitHub</Text>
            <TextInput
              style={styles.input}
              value={formData.github}
              onChangeText={(value) => setFormData(prev => ({ ...prev, github: value }))}
              placeholder="https://github.com/yourusername"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Portfolio</Text>
            <TextInput
              style={styles.input}
              value={formData.portfolio}
              onChangeText={(value) => setFormData(prev => ({ ...prev, portfolio: value }))}
              placeholder="https://yourportfolio.com"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: async () => {
                    await logout();
                    router.replace('/login');
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Skill Modal */}
      <Modal
        visible={showAddSkill}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddSkill(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Skill</Text>
            <TextInput
              style={styles.input}
              placeholder="Skill name"
              placeholderTextColor={theme.colors.textMuted}
              value={newSkill.skillName}
              onChangeText={(text) => setNewSkill(prev => ({ ...prev, skillName: text }))}
            />
            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.pickerRow}>
              {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.pickerOption,
                    newSkill.skillLevel === level && styles.pickerOptionSelected
                  ]}
                  onPress={() => setNewSkill(prev => ({ ...prev, skillLevel: level }))}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    newSkill.skillLevel === level && styles.pickerOptionTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setNewSkill(prev => ({ ...prev, offering: !prev.offering }))}
              >
                <Text>{newSkill.offering ? '☑' : '☐'} Offering</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setNewSkill(prev => ({ ...prev, seeking: !prev.seeking }))}
              >
                <Text>{newSkill.seeking ? '☑' : '☐'} Seeking</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddSkill(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={addSkill}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Interest Modal */}
      <Modal
        visible={showAddInterest}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddInterest(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Interest</Text>
            <TextInput
              style={styles.input}
              placeholder="Interest name"
              placeholderTextColor={theme.colors.textMuted}
              value={newInterest.interestName}
              onChangeText={(text) => setNewInterest(prev => ({ ...prev, interestName: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Category (optional)"
              placeholderTextColor={theme.colors.textMuted}
              value={newInterest.category}
              onChangeText={(text) => setNewInterest(prev => ({ ...prev, category: text }))}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddInterest(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={addInterest}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Organization Modal */}
      <Modal
        visible={showAddOrg}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddOrg(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Organization</Text>
            <TextInput
              style={styles.input}
              placeholder="Organization name"
              placeholderTextColor={theme.colors.textMuted}
              value={newOrg.organizationName}
              onChangeText={(text) => setNewOrg(prev => ({ ...prev, organizationName: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Your role (optional)"
              placeholderTextColor={theme.colors.textMuted}
              value={newOrg.role}
              onChangeText={(text) => setNewOrg(prev => ({ ...prev, role: text }))}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddOrg(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={addOrganization}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Language Modal */}
      <Modal
        visible={showAddLanguage}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddLanguage(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Language</Text>
            <TextInput
              style={styles.input}
              placeholder="Language name"
              placeholderTextColor={theme.colors.textMuted}
              value={newLanguage.languageName}
              onChangeText={(text) => setNewLanguage(prev => ({ ...prev, languageName: text }))}
            />
            <Text style={styles.label}>Proficiency Level</Text>
            <View style={styles.pickerRow}>
              {['Native', 'Fluent', 'Conversational', 'Basic'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.pickerOption,
                    newLanguage.proficiencyLevel === level && styles.pickerOptionSelected
                  ]}
                  onPress={() => setNewLanguage(prev => ({ ...prev, proficiencyLevel: level }))}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    newLanguage.proficiencyLevel === level && styles.pickerOptionTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddLanguage(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={addLanguage}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.borderColor,
    paddingBottom: theme.spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  inputGroup: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  input: {
    backgroundColor: theme.colors.bgSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 16, // Prevents zoom on iOS
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: theme.colors.accentPrimary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
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
  locationRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: theme.colors.accentPrimary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonText: {
    fontSize: 20,
  },
  locationStatus: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  photoSection: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.bgSecondary,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.borderColor,
  },
  photoPlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  uploadButton: {
    backgroundColor: theme.colors.accentPrimary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 150,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addButton: {
    backgroundColor: theme.colors.accentPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  itemsList: {
    gap: theme.spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.bgSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  itemDetail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
  deleteButtonText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.bgCard,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  pickerOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    backgroundColor: theme.colors.bgSecondary,
  },
  pickerOptionSelected: {
    backgroundColor: theme.colors.accentPrimary,
    borderColor: theme.colors.accentPrimary,
  },
  pickerOptionText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: theme.colors.bgSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  modalButtonSave: {
    backgroundColor: theme.colors.accentPrimary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

