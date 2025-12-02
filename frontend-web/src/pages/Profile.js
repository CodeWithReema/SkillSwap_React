import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  userAPI,
  profileAPI,
  userSkillAPI,
  userInterestAPI,
  userOrganizationAPI,
  userLanguageAPI,
  photoAPI,
  cityAPI,
} from '../services/api';

const Profile = () => {
  const { getCurrentUserId, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    major: '',
    year: '',
    location: '',
    showLocation: false,
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
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [locationDebounceTimer, setLocationDebounceTimer] = useState(null);

  // Add/Edit states
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ skillName: '', skillLevel: 'Intermediate', offering: false, seeking: false });
  const [showAddInterest, setShowAddInterest] = useState(false);
  const [newInterest, setNewInterest] = useState({ interestName: '', category: '' });
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({ organizationName: '', role: '' });
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState({ languageName: '', proficiencyLevel: 'Native' });

  const toAbsoluteUrl = (url) => {
    if (!url) return '';
    try {
      const base = process.env.REACT_APP_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      return new URL(url, base).toString();
    } catch (e) {
      return url;
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizePhotos = (photoList = []) => {
    return photoList
      .map(photo => ({
        ...photo,
        photoUrl: toAbsoluteUrl(photo.photoUrl),
        isPrimary: Boolean(photo.isPrimary),
      }))
      .sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
        const aDate = a.uploadedAt ? new Date(a.uploadedAt) : 0;
        const bDate = b.uploadedAt ? new Date(b.uploadedAt) : 0;
        return bDate - aDate;
      });
  };

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
      const currentProfile = profiles.find(p => p.user?.userId === userId);

      setUser(currentUser);
      setProfile(currentProfile);

      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
        }));
      }

      if (currentProfile) {
        setFormData(prev => ({
          ...prev,
          bio: currentProfile.bio || '',
          major: currentProfile.major || '',
          year: currentProfile.year || '',
          location: currentProfile.location || '',
          showLocation: currentProfile.showLocation || false,
          careerGoals: currentProfile.careerGoals || '',
          availability: currentProfile.availability || '',
          career: currentProfile.career || '',
          careerExperience: currentProfile.careerExperience || '',
          researchPublications: currentProfile.researchPublications || '',
          awards: currentProfile.awards || '',
          linkedin: currentProfile.linkedin || '',
          github: currentProfile.github || '',
          portfolio: currentProfile.portfolio || '',
        }));

        if (currentProfile.latitude && currentProfile.longitude) {
          setLocationStatus('Location set');
        }

        try {
          const profilePhotos = await photoAPI.getByProfile(currentProfile.profileId);
          setPhotos(profilePhotos);
        } catch (error) {
          console.error('Error loading photos:', error);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLocationInput = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, location: value }));

    if (locationDebounceTimer) {
      clearTimeout(locationDebounceTimer);
    }

    if (value.length < 2) {
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const suggestions = await cityAPI.getSuggestions(value);
        if (suggestions && Array.isArray(suggestions)) {
          setLocationSuggestions(suggestions);
          setShowLocationSuggestions(true);
        } else {
          setLocationSuggestions([]);
          setShowLocationSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    }, 300);

    setLocationDebounceTimer(timer);
  };

  const selectLocation = (location) => {
    setFormData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    if (locationDebounceTimer) {
      clearTimeout(locationDebounceTimer);
      setLocationDebounceTimer(null);
    }
  };

  useEffect(() => {
    return () => {
      if (locationDebounceTimer) {
        clearTimeout(locationDebounceTimer);
      }
    };
  }, [locationDebounceTimer]);

  const usePreciseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported');
      return;
    }

    setLocationStatus('Getting location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
            { headers: { 'User-Agent': 'SkillSwap/1.0' } }
          );
          const data = await response.json();

          let cityName = '';
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const state = data.address.state_code || data.address.state || '';
            cityName = city && state ? `${city}, ${state}` : city || state;
          }

          const locationText = cityName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          setFormData(prev => ({ ...prev, location: locationText }));

          const userId = getCurrentUserId();
          const locationData = {
            latitude: lat,
            longitude: lon,
            location: locationText,
            showLocation: formData.showLocation,
          };

          if (profile?.profileId) {
            await profileAPI.updateLocation(profile.profileId, locationData);
          }
          await userAPI.updateLocation(userId, {
            latitude: lat,
            longitude: lon,
            showLocation: formData.showLocation,
          });

          setLocationStatus('Location saved successfully!');
        } catch (error) {
          console.error('Error saving location:', error);
          setLocationStatus('Error saving location');
        }
      },
      (error) => {
        setLocationStatus('Error getting location');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const userId = getCurrentUserId();

      const updatedUser = await userAPI.update(userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      updateUser(updatedUser);
      setUser(updatedUser);

      const profileData = {
        user: updatedUser,
        ...formData,
      };

      let updatedProfile;
      if (profile?.profileId) {
        updatedProfile = await profileAPI.update(profile.profileId, profileData);
      } else {
        updatedProfile = await profileAPI.create(profileData);
      }

      setProfile(updatedProfile);
      setLocationStatus('Profile saved successfully!');
      setTimeout(() => setLocationStatus(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setLocationStatus('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !profile?.profileId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('profileId', profile.profileId);
    formData.append('isPrimary', photos.length === 0);

    try {
      await photoAPI.upload(formData);
      await loadProfile();
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const addSkill = async () => {
    try {
      await userSkillAPI.create({
        user: { userId: getCurrentUserId() },
        ...newSkill,
      });
      await loadProfile();
      setNewSkill({ skillName: '', skillLevel: 'Intermediate', offering: false, seeking: false });
      setShowAddSkill(false);
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const deleteSkill = async (skillId) => {
    if (window.confirm('Delete this skill?')) {
      try {
        await userSkillAPI.delete(skillId);
        await loadProfile();
      } catch (error) {
        console.error('Error deleting skill:', error);
      }
    }
  };

  const addInterest = async () => {
    try {
      await userInterestAPI.create({
        user: { userId: getCurrentUserId() },
        ...newInterest,
      });
      await loadProfile();
      setNewInterest({ interestName: '', category: '' });
      setShowAddInterest(false);
    } catch (error) {
      console.error('Error adding interest:', error);
    }
  };

  const deleteInterest = async (interestId) => {
    if (window.confirm('Delete this interest?')) {
      try {
        await userInterestAPI.delete(interestId);
        await loadProfile();
      } catch (error) {
        console.error('Error deleting interest:', error);
      }
    }
  };

  const addOrganization = async () => {
    try {
      await userOrganizationAPI.create({
        user: { userId: getCurrentUserId() },
        ...newOrg,
      });
      await loadProfile();
      setNewOrg({ organizationName: '', role: '' });
      setShowAddOrg(false);
    } catch (error) {
      console.error('Error adding organization:', error);
    }
  };

  const deleteOrganization = async (orgId) => {
    if (window.confirm('Delete this organization?')) {
      try {
        await userOrganizationAPI.delete(orgId);
        await loadProfile();
      } catch (error) {
        console.error('Error deleting organization:', error);
      }
    }
  };

  const addLanguage = async () => {
    try {
      await userLanguageAPI.create({
        user: { userId: getCurrentUserId() },
        ...newLanguage,
      });
      await loadProfile();
      setNewLanguage({ languageName: '', proficiencyLevel: 'Native' });
      setShowAddLanguage(false);
    } catch (error) {
      console.error('Error adding language:', error);
    }
  };

  const deleteLanguage = async (languageId) => {
    if (window.confirm('Delete this language?')) {
      try {
        await userLanguageAPI.delete(languageId);
        await loadProfile();
      } catch (error) {
        console.error('Error deleting language:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-glass-accent-primary rounded-full mix-blend-screen opacity-20 blur-3xl animate-pulse-slow"></div>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-glass-accent-primary relative z-10"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-glass-accent-primary rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-glass-accent-secondary rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-6xl font-bold text-glass-text-primary mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Edit Profile
          </h1>
          {locationStatus && (
            <div className={`inline-block px-5 py-3 rounded-2xl text-sm mb-4 backdrop-blur-sm shadow-glass ${
              locationStatus.includes('Error') 
                ? 'bg-glass-accent-danger/20 text-glass-accent-danger border border-glass-accent-danger' 
                : 'bg-glass-accent-success/20 text-glass-accent-success border border-glass-accent-success'
            }`}>
              {locationStatus}
            </div>
          )}
        </motion.div>

        {/* Split Panel Layout - Completely Different */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Photo & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Photo - Large, Centered */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card floating-card text-center"
            >
              <div className="mb-6">
                {photos.length > 0 && photos[0]?.photoUrl ? (
                  <img 
                    src={photos[0].photoUrl} 
                    alt="Profile" 
                    className="w-48 h-48 rounded-3xl object-cover border-2 border-glass-border shadow-glass-xl mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-3xl bg-gradient-primary flex items-center justify-center text-6xl font-bold text-white border-2 border-glass-border shadow-glass-xl mx-auto">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="btn btn-secondary cursor-pointer w-full">
                Upload Photo
              </label>
            </motion.div>
          </div>

          {/* Right Column - Main Form Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card"
            >
              <h2 className="text-2xl font-bold text-glass-text-primary mb-6 flex items-center gap-3">
                <span className="text-2xl">👤</span>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-glass-text-secondary mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="input"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-glass-text-secondary mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="input"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-glass-text-secondary mb-2">Bio</label>
                  <textarea
                    name="bio"
                    className="input min-h-[100px] resize-none"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-glass-text-secondary mb-2">Major</label>
                  <input
                    type="text"
                    name="major"
                    className="input"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-glass-text-secondary mb-2">Year</label>
                  <select name="year" className="input" value={formData.year} onChange={handleChange}>
                    <option value="">Select Year</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Faculty">Faculty</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card"
            >
            <h2 className="text-2xl font-bold text-glass-text-primary mb-6 flex items-center gap-3">
              <span className="text-2xl">📍</span>
              Location
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  className="input"
                  value={formData.location}
                  onChange={handleLocationInput}
                  onFocus={() => {
                    if (formData.location.length >= 2 && locationSuggestions.length > 0) {
                      setShowLocationSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowLocationSuggestions(false);
                    }, 250);
                  }}
                  placeholder="City, State (e.g., Atlanta, GA)"
                  autoComplete="off"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto rounded-2xl border border-glass-border shadow-glass-lg" style={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(20px)' }}>
                    {locationSuggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="p-3 hover:bg-glass-bg-hover cursor-pointer rounded-xl transition-colors text-glass-text-primary"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectLocation(suggestion);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={usePreciseLocation}
              >
                📍 Use My Location
              </button>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="showLocation"
                  checked={formData.showLocation}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-glass-border bg-glass-bg-card text-glass-accent-primary focus:ring-glass-accent-primary"
                />
                <span className="text-glass-text-secondary">Show my location for matching</span>
              </label>
            </div>
            </motion.div>

            {/* Career Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card"
            >
            <h2 className="text-2xl font-bold text-glass-text-primary mb-6 flex items-center gap-3">
              <span className="text-2xl">💼</span>
              Career Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">Career Goals</label>
                <textarea
                  name="careerGoals"
                  className="input min-h-[80px] resize-none"
                  value={formData.careerGoals}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">Availability</label>
                <select name="availability" className="input" value={formData.availability} onChange={handleChange}>
                  <option value="">Select Availability</option>
                  <option value="Very Available">Very Available (10+ hours/week)</option>
                  <option value="Moderately Available">Moderately Available (5-10 hours/week)</option>
                  <option value="Limited Availability">Limited Availability (1-5 hours/week)</option>
                  <option value="On Demand">On Demand (As needed)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">Career/Job Title</label>
                <input
                  type="text"
                  name="career"
                  className="input"
                  value={formData.career}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">Career Experience</label>
                <textarea
                  name="careerExperience"
                  className="input min-h-[100px] resize-none"
                  value={formData.careerExperience}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">Research & Publications</label>
                <textarea
                  name="researchPublications"
                  className="input min-h-[100px] resize-none"
                  value={formData.researchPublications}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">Awards & Achievements</label>
                <textarea
                  name="awards"
                  className="input min-h-[100px] resize-none"
                  value={formData.awards}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </div>
            </motion.div>

            {/* Skills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card"
            >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-glass-text-primary flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                My Skills
              </h2>
              {!showAddSkill && (
                <button type="button" className="btn btn-secondary text-sm" onClick={() => setShowAddSkill(true)}>
                  + Add Skill
                </button>
              )}
            </div>
            {showAddSkill ? (
              <div className="mb-6 p-4 rounded-xl border border-glass-border space-y-4" style={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(20px)' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Skill name"
                  value={newSkill.skillName}
                  onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                />
                <select
                  className="input"
                  value={newSkill.skillLevel}
                  onChange={(e) => setNewSkill({ ...newSkill, skillLevel: e.target.value })}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSkill.offering}
                      onChange={(e) => setNewSkill({ ...newSkill, offering: e.target.checked })}
                      className="w-4 h-4 rounded border-glass-border bg-glass-bg-card text-glass-accent-primary"
                    />
                    <span className="text-glass-text-secondary">Offering</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSkill.seeking}
                      onChange={(e) => setNewSkill({ ...newSkill, seeking: e.target.checked })}
                      className="w-4 h-4 rounded border-glass-border bg-glass-bg-card text-glass-accent-primary"
                    />
                    <span className="text-glass-text-secondary">Seeking</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-primary flex-1" onClick={addSkill}>Add</button>
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddSkill(false)}>Cancel</button>
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              {skills.map(skill => (
                <div key={skill.skillId} className="flex items-center justify-between p-4 bg-glass-bg-card rounded-xl border border-glass-border">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-glass-text-primary">{skill.skillName}</span>
                    <span className="text-sm text-glass-text-secondary">- {skill.skillLevel}</span>
                    {skill.offering && <span className="px-2 py-1 text-xs rounded-lg bg-glass-accent-success/20 text-glass-accent-success">Offering</span>}
                    {skill.seeking && <span className="px-2 py-1 text-xs rounded-lg bg-glass-accent-info/20 text-glass-accent-info">Seeking</span>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger text-sm"
                    onClick={() => deleteSkill(skill.skillId)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {skills.length === 0 && !showAddSkill && (
                <p className="text-glass-text-muted text-center py-4">No skills added yet</p>
              )}
            </div>
            </motion.div>

            {/* Interests */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card"
            >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-glass-text-primary flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                Interests & Hobbies
              </h2>
              {!showAddInterest && (
                <button type="button" className="btn btn-secondary text-sm" onClick={() => setShowAddInterest(true)}>
                  + Add Interest
                </button>
              )}
            </div>
            {showAddInterest ? (
              <div className="mb-6 p-4 rounded-xl border border-glass-border space-y-4" style={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(20px)' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Interest name"
                  value={newInterest.interestName}
                  onChange={(e) => setNewInterest({ ...newInterest, interestName: e.target.value })}
                />
                <select
                  className="input"
                  value={newInterest.category}
                  onChange={(e) => setNewInterest({ ...newInterest, category: e.target.value })}
                >
                  <option value="">Category (optional)</option>
                  {['Technology', 'Arts', 'Sports', 'Music', 'Travel', 'Food', 'Gaming', 'Reading', 'Other'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-primary flex-1" onClick={addInterest}>Add</button>
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddInterest(false)}>Cancel</button>
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              {interests.map(interest => (
                <div key={interest.interestId} className="flex items-center justify-between p-4 bg-glass-bg-card rounded-xl border border-glass-border">
                  <div>
                    <span className="font-semibold text-glass-text-primary">{interest.interestName}</span>
                    {interest.category && <span className="ml-2 text-sm text-glass-text-secondary">({interest.category})</span>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger text-sm"
                    onClick={() => deleteInterest(interest.interestId)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {interests.length === 0 && !showAddInterest && (
                <p className="text-glass-text-muted text-center py-4">No interests added yet</p>
              )}
            </div>
            </motion.div>

            {/* Organizations */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card"
            >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-glass-text-primary flex items-center gap-3">
                <span className="text-2xl">🏛️</span>
                Organizations & Clubs
              </h2>
              {!showAddOrg && (
                <button type="button" className="btn btn-secondary text-sm" onClick={() => setShowAddOrg(true)}>
                  + Add Organization
                </button>
              )}
            </div>
            {showAddOrg ? (
              <div className="mb-6 p-4 rounded-xl border border-glass-border space-y-4" style={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(20px)' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Organization name"
                  value={newOrg.organizationName}
                  onChange={(e) => setNewOrg({ ...newOrg, organizationName: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Your role"
                  value={newOrg.role}
                  onChange={(e) => setNewOrg({ ...newOrg, role: e.target.value })}
                />
                <div className="flex gap-2">
                  <button type="button" className="btn btn-primary flex-1" onClick={addOrganization}>Add</button>
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddOrg(false)}>Cancel</button>
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              {organizations.map(org => (
                <div key={org.orgId} className="flex items-center justify-between p-4 bg-glass-bg-card rounded-xl border border-glass-border">
                  <div>
                    <span className="font-semibold text-glass-text-primary">{org.organizationName}</span>
                    {org.role && <span className="ml-2 text-sm text-glass-text-secondary">- {org.role}</span>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger text-sm"
                    onClick={() => deleteOrganization(org.orgId)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {organizations.length === 0 && !showAddOrg && (
                <p className="text-glass-text-muted text-center py-4">No organizations added yet</p>
              )}
            </div>
            </motion.div>

            {/* Languages */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card"
            >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-glass-text-primary flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                Languages
              </h2>
              {!showAddLanguage && (
                <button type="button" className="btn btn-secondary text-sm" onClick={() => setShowAddLanguage(true)}>
                  + Add Language
                </button>
              )}
            </div>
            {showAddLanguage ? (
              <div className="mb-6 p-4 rounded-xl border border-glass-border space-y-4" style={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(20px)' }}>
                <select
                  className="input"
                  value={newLanguage.languageName}
                  onChange={(e) => setNewLanguage({ ...newLanguage, languageName: e.target.value })}
                >
                  <option value="">Select Language</option>
                  {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Italian'].map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <select
                  className="input"
                  value={newLanguage.proficiencyLevel}
                  onChange={(e) => setNewLanguage({ ...newLanguage, proficiencyLevel: e.target.value })}
                >
                  <option value="Native">Native</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Basic">Basic</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-primary flex-1" onClick={addLanguage}>Add</button>
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowAddLanguage(false)}>Cancel</button>
                </div>
              </div>
            ) : null}
            <div className="space-y-2">
              {languages.map(lang => (
                <div key={lang.languageId} className="flex items-center justify-between p-4 bg-glass-bg-card rounded-xl border border-glass-border">
                  <div>
                    <span className="font-semibold text-glass-text-primary">{lang.languageName}</span>
                    <span className="ml-2 text-sm text-glass-text-secondary">- {lang.proficiencyLevel}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger text-sm"
                    onClick={() => deleteLanguage(lang.languageId)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {languages.length === 0 && !showAddLanguage && (
                <p className="text-glass-text-muted text-center py-4">No languages added yet</p>
              )}
            </div>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card"
            >
            <h2 className="text-2xl font-bold text-glass-text-primary mb-6 flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              Social Links
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  className="input"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">GitHub</label>
                <input
                  type="url"
                  name="github"
                  className="input"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-text-secondary mb-2">Portfolio Website</label>
                <input
                  type="url"
                  name="portfolio"
                  className="input"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
            </motion.div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button type="submit" className="btn btn-primary px-12 py-5 text-lg" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

