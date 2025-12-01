import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI, profileAPI, userSkillAPI, userInterestAPI, userOrganizationAPI, userLanguageAPI, photoAPI } from '../services/api';
import './ViewProfile.css';

const ViewProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (currentProfile) {
        try {
          const profilePhotos = await photoAPI.getByProfile(currentProfile.profileId);
          setPhotos(profilePhotos);
        } catch (error) {
          console.error('Error loading photos:', error);
        }
      }

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
      <div className="view-profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="view-profile-container">
        <div className="error-state">
          <h2>Profile not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="view-profile-container">
      <div className="view-profile-header">
        <div className="profile-cover">
          {photos.length > 0 && photos[0]?.photoUrl ? (
            <img src={photos[0].photoUrl} alt="Profile" className="cover-photo" />
          ) : (
            <div className="cover-placeholder"></div>
          )}
        </div>
        <div className="profile-header-content">
          <div className="profile-avatar-large">
            {photos.length > 0 && photos[0]?.photoUrl ? (
              <img src={photos[0].photoUrl} alt="Profile" />
            ) : (
              <div className="avatar-placeholder-large">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
          </div>
          <div className="profile-header-info">
            <h1>{user.firstName} {user.lastName}</h1>
            <p className="profile-major">{profile?.major || 'No major specified'}</p>
            <p className="profile-year">{profile?.year || ''}</p>
            {profile?.location && (
              <p className="profile-location">📍 {profile.location}</p>
            )}
          </div>
        </div>
      </div>

      <div className="view-profile-content">
        <div className="profile-main">
          {profile?.bio && (
            <section className="profile-section">
              <h2>About</h2>
              <p>{profile.bio}</p>
            </section>
          )}

          {skills.length > 0 && (
            <section className="profile-section">
              <h2>Skills</h2>
              <div className="skills-grid">
                {skills.map(skill => (
                  <div key={skill.skillId} className="skill-tag">
                    <span className="skill-name">{skill.skillName}</span>
                    <span className="skill-level">{skill.skillLevel}</span>
                    {skill.offering && <span className="badge offering">Offering</span>}
                    {skill.seeking && <span className="badge seeking">Seeking</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {interests.length > 0 && (
            <section className="profile-section">
              <h2>Interests</h2>
              <div className="interests-list">
                {interests.map(interest => (
                  <span key={interest.interestId} className="interest-tag">
                    {interest.interestName}
                  </span>
                ))}
              </div>
            </section>
          )}

          {profile?.careerGoals && (
            <section className="profile-section">
              <h2>Career Goals</h2>
              <p>{profile.careerGoals}</p>
            </section>
          )}

          {profile?.careerExperience && (
            <section className="profile-section">
              <h2>Career Experience</h2>
              <p>{profile.careerExperience}</p>
            </section>
          )}

          {organizations.length > 0 && (
            <section className="profile-section">
              <h2>Organizations</h2>
              <div className="organizations-list">
                {organizations.map(org => (
                  <div key={org.orgId} className="org-item">
                    <strong>{org.organizationName}</strong>
                    {org.role && <span> - {org.role}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section className="profile-section">
              <h2>Languages</h2>
              <div className="languages-list">
                {languages.map(lang => (
                  <div key={lang.languageId} className="language-item">
                    <strong>{lang.languageName}</strong> - {lang.proficiencyLevel}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(profile?.linkedin || profile?.github || profile?.portfolio) && (
            <section className="profile-section">
              <h2>Social Links</h2>
              <div className="social-links">
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                    LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="social-link">
                    GitHub
                  </a>
                )}
                {profile.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="social-link">
                    Portfolio
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;

