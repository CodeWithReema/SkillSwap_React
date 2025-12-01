import React, { useState, useEffect } from 'react';
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
import './Profile.css';

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

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Load photos
        try {
          const profilePhotos = await photoAPI.getByProfile(currentProfile.profileId);
          setPhotos(profilePhotos);
        } catch (error) {
          console.error('Error loading photos:', error);
        }
      }

      // Load related data
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

    // Clear previous timer
    if (locationDebounceTimer) {
      clearTimeout(locationDebounceTimer);
    }

    if (value.length < 2) {
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
      return;
    }

    // Debounce the API call
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
    }, 300); // 300ms debounce

    setLocationDebounceTimer(timer);
  };

  const selectLocation = (location) => {
    setFormData(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    // Clear debounce timer
    if (locationDebounceTimer) {
      clearTimeout(locationDebounceTimer);
      setLocationDebounceTimer(null);
    }
  };

  // Cleanup timer on unmount
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
          // Reverse geocode
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

          // Update location in backend
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

      // Update user
      const updatedUser = await userAPI.update(userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      updateUser(updatedUser);
      setUser(updatedUser);

      // Update or create profile
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

  // Skill management
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ skillName: '', skillLevel: 'Intermediate', offering: false, seeking: false });

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

  // Interest management
  const [showAddInterest, setShowAddInterest] = useState(false);
  const [newInterest, setNewInterest] = useState({ interestName: '', category: '' });

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

  // Organization management
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [newOrg, setNewOrg] = useState({ organizationName: '', role: '' });

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

  // Language management
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState({ languageName: '', proficiencyLevel: 'Native' });

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
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Edit Profile</h1>
        {locationStatus && (
          <div className={`status-message ${locationStatus.includes('Error') ? 'error' : 'success'}`}>
            {locationStatus}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-grid">
          {/* Left Column */}
          <div className="profile-column">
            {/* Profile Photo */}
            <div className="profile-section">
              <h3>Profile Photo</h3>
              <div className="photo-upload-area">
                {photos.length > 0 && photos[0]?.photoUrl ? (
                  <img src={photos[0].photoUrl} alt="Profile" className="profile-photo-preview" />
                ) : (
                  <div className="photo-placeholder">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="photo-input"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="btn btn-secondary">
                  Upload Photo
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="profile-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="input"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="input"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  className="textarea"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Major</label>
                  <input
                    type="text"
                    name="major"
                    className="input"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select name="year" className="select" value={formData.year} onChange={handleChange}>
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

              <div className="form-group">
                <label>Location</label>
                <div className="location-input-wrapper">
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
                      // Delay hiding to allow click on suggestion
                      setTimeout(() => {
                        setShowLocationSuggestions(false);
                      }, 250);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown' && locationSuggestions.length > 0) {
                        e.preventDefault();
                        const firstSuggestion = document.querySelector('.suggestion-item');
                        if (firstSuggestion) {
                          firstSuggestion.focus();
                        }
                      } else if (e.key === 'Escape') {
                        setShowLocationSuggestions(false);
                      }
                    }}
                    placeholder="City, State (e.g., Atlanta, GA)"
                    autoComplete="off"
                    autoCapitalize="words"
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={usePreciseLocation}
                  >
                    📍 Use My Location
                  </button>
                  {showLocationSuggestions && locationSuggestions.length > 0 && (
                    <div className="location-suggestions">
                      {locationSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="suggestion-item"
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur
                            selectLocation(suggestion);
                          }}
                          onClick={() => selectLocation(suggestion)}
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="showLocation"
                    checked={formData.showLocation}
                    onChange={handleChange}
                  />
                  Show my location for matching
                </label>
              </div>

              <div className="form-group">
                <label>Career Goals</label>
                <textarea
                  name="careerGoals"
                  className="textarea"
                  value={formData.careerGoals}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Availability</label>
                <select name="availability" className="select" value={formData.availability} onChange={handleChange}>
                  <option value="">Select Availability</option>
                  <option value="Very Available">Very Available (10+ hours/week)</option>
                  <option value="Moderately Available">Moderately Available (5-10 hours/week)</option>
                  <option value="Limited Availability">Limited Availability (1-5 hours/week)</option>
                  <option value="On Demand">On Demand (As needed)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Career/Job Title</label>
                <input
                  type="text"
                  name="career"
                  className="input"
                  value={formData.career}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="form-group">
                <label>Career Experience</label>
                <textarea
                  name="careerExperience"
                  className="textarea"
                  value={formData.careerExperience}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Research & Publications</label>
                <textarea
                  name="researchPublications"
                  className="textarea"
                  value={formData.researchPublications}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Awards & Achievements</label>
                <textarea
                  name="awards"
                  className="textarea"
                  value={formData.awards}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </div>

            {/* Languages */}
            <div className="profile-section">
              <h3>Languages</h3>
              <div className="items-list">
                {languages.map(lang => (
                  <div key={lang.languageId} className="item-card">
                    <div>
                      <strong>{lang.languageName}</strong> - {lang.proficiencyLevel}
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteLanguage(lang.languageId)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              {showAddLanguage ? (
                <div className="add-item-form">
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
                  <div className="form-actions">
                    <button type="button" className="btn btn-primary" onClick={addLanguage}>Add</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddLanguage(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddLanguage(true)}>
                  Add Language
                </button>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="profile-column">
            {/* Skills */}
            <div className="profile-section">
              <h3>My Skills</h3>
              <div className="items-list">
                {skills.map(skill => (
                  <div key={skill.skillId} className="item-card">
                    <div>
                      <strong>{skill.skillName}</strong> - {skill.skillLevel}
                      {skill.offering && <span className="badge offering">Offering</span>}
                      {skill.seeking && <span className="badge seeking">Seeking</span>}
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteSkill(skill.skillId)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              {showAddSkill ? (
                <div className="add-item-form">
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
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newSkill.offering}
                        onChange={(e) => setNewSkill({ ...newSkill, offering: e.target.checked })}
                      />
                      Offering
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newSkill.seeking}
                        onChange={(e) => setNewSkill({ ...newSkill, seeking: e.target.checked })}
                      />
                      Seeking
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-primary" onClick={addSkill}>Add</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddSkill(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSkill(true)}>
                  Add Skill
                </button>
              )}
            </div>

            {/* Interests */}
            <div className="profile-section">
              <h3>Interests & Hobbies</h3>
              <div className="items-list">
                {interests.map(interest => (
                  <div key={interest.interestId} className="item-card">
                    <div>
                      <strong>{interest.interestName}</strong>
                      {interest.category && <span className="badge"> {interest.category}</span>}
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteInterest(interest.interestId)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              {showAddInterest ? (
                <div className="add-item-form">
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
                  <div className="form-actions">
                    <button type="button" className="btn btn-primary" onClick={addInterest}>Add</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddInterest(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddInterest(true)}>
                  Add Interest
                </button>
              )}
            </div>

            {/* Organizations */}
            <div className="profile-section">
              <h3>Organizations & Clubs</h3>
              <div className="items-list">
                {organizations.map(org => (
                  <div key={org.orgId} className="item-card">
                    <div>
                      <strong>{org.organizationName}</strong>
                      {org.role && <span> - {org.role}</span>}
                    </div>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteOrganization(org.orgId)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              {showAddOrg ? (
                <div className="add-item-form">
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
                  <div className="form-actions">
                    <button type="button" className="btn btn-primary" onClick={addOrganization}>Add</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddOrg(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddOrg(true)}>
                  Add Organization
                </button>
              )}
            </div>

            {/* Social Links */}
            <div className="profile-section">
              <h3>Social Links</h3>
              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  className="input"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="form-group">
                <label>GitHub</label>
                <input
                  type="url"
                  name="github"
                  className="input"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div className="form-group">
                <label>Portfolio Website</label>
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
          </div>
        </div>

        <div className="profile-actions">
          <button type="submit" className="btn btn-primary btn-large" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

