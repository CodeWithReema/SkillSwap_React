import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userAPI, profileAPI, userSkillAPI, userInterestAPI, userOrganizationAPI, userLanguageAPI, photoAPI } from '../services/api';

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
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-glass-accent-primary rounded-full mix-blend-screen opacity-20 blur-3xl animate-pulse-slow"></div>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-glass-accent-primary relative z-10"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="glass-card text-center py-16">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-bold text-glass-text-primary">Profile not found</h2>
        </div>
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
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card floating-card mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-shrink-0">
              {photos.length > 0 && photos[0]?.photoUrl ? (
                <div className="relative">
                  <img 
                    src={photos[0].photoUrl} 
                    alt="Profile" 
                    className="w-40 h-40 rounded-3xl object-cover border-2 border-glass-border shadow-glass-xl"
                  />
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-glass-accent-primary/20 to-glass-accent-secondary/20 pointer-events-none"></div>
                </div>
              ) : (
                <div className="w-40 h-40 rounded-3xl bg-gradient-primary flex items-center justify-center text-5xl font-bold text-white border-2 border-glass-border shadow-glass-xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-glass-text-primary mb-3 bg-gradient-primary bg-clip-text text-transparent">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-glass-accent-primary font-semibold text-lg mb-2">{profile?.major || 'No major specified'}</p>
              {profile?.year && <p className="text-glass-text-secondary text-lg mb-2">{profile.year}</p>}
              {profile?.location && (
                <p className="text-glass-text-secondary text-lg flex items-center justify-center md:justify-start gap-2">
                  <span>📍</span>
                  {profile.location}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {profile?.bio && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  About
                </h2>
                <p className="text-glass-text-secondary leading-relaxed text-lg">{profile.bio}</p>
              </motion.div>
            )}

            {skills.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {skills.map(skill => (
                    <div key={skill.skillId} className="px-5 py-3 bg-glass-bg-card rounded-2xl border border-glass-border hover:border-glass-border-light transition-colors">
                      <span className="font-semibold text-glass-text-primary">{skill.skillName}</span>
                      <span className="text-sm text-glass-text-secondary ml-2">- {skill.skillLevel}</span>
                      {skill.offering && <span className="ml-2 px-2 py-1 text-xs rounded-lg bg-glass-accent-success/20 text-glass-accent-success">Offering</span>}
                      {skill.seeking && <span className="ml-2 px-2 py-1 text-xs rounded-lg bg-glass-accent-info/20 text-glass-accent-info">Seeking</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {interests.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">⭐</span>
                  Interests
                </h2>
                <div className="flex flex-wrap gap-3">
                  {interests.map(interest => (
                    <span key={interest.interestId} className="px-5 py-3 bg-glass-bg-card rounded-2xl border border-glass-border text-glass-text-primary hover:border-glass-border-light transition-colors">
                      {interest.interestName}
                      {interest.category && <span className="text-sm text-glass-text-secondary ml-2">({interest.category})</span>}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {profile?.careerGoals && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  Career Goals
                </h2>
                <p className="text-glass-text-secondary leading-relaxed text-lg">{profile.careerGoals}</p>
              </motion.div>
            )}

            {profile?.careerExperience && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">💼</span>
                  Career Experience
                </h2>
                <p className="text-glass-text-secondary leading-relaxed whitespace-pre-wrap text-lg">{profile.careerExperience}</p>
              </motion.div>
            )}

            {organizations.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">🏛️</span>
                  Organizations
                </h2>
                <div className="space-y-3">
                  {organizations.map(org => (
                    <div key={org.orgId} className="p-5 bg-glass-bg-card rounded-2xl border border-glass-border hover:border-glass-border-light transition-colors">
                      <span className="font-semibold text-glass-text-primary text-lg">{org.organizationName}</span>
                      {org.role && <span className="text-glass-text-secondary ml-2">- {org.role}</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {languages.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  Languages
                </h2>
                <div className="space-y-3">
                  {languages.map(lang => (
                    <div key={lang.languageId} className="p-5 bg-glass-bg-card rounded-2xl border border-glass-border hover:border-glass-border-light transition-colors">
                      <span className="font-semibold text-glass-text-primary text-lg">{lang.languageName}</span>
                      <span className="text-glass-text-secondary ml-2">- {lang.proficiencyLevel}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {(profile?.linkedin || profile?.github || profile?.portfolio) && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card floating-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">🔗</span>
                  Social Links
                </h2>
                <div className="space-y-3">
                  {profile.linkedin && (
                    <a 
                      href={profile.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block p-4 bg-glass-bg-card rounded-2xl border border-glass-border hover:bg-glass-bg-hover hover:border-glass-border-light transition-all text-glass-text-primary font-semibold"
                    >
                      🔗 LinkedIn
                    </a>
                  )}
                  {profile.github && (
                    <a 
                      href={profile.github} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block p-4 bg-glass-bg-card rounded-2xl border border-glass-border hover:bg-glass-bg-hover hover:border-glass-border-light transition-all text-glass-text-primary font-semibold"
                    >
                      🔗 GitHub
                    </a>
                  )}
                  {profile.portfolio && (
                    <a 
                      href={profile.portfolio} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block p-4 bg-glass-bg-card rounded-2xl border border-glass-border hover:bg-glass-bg-hover hover:border-glass-border-light transition-all text-glass-text-primary font-semibold"
                    >
                      🔗 Portfolio
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {profile?.researchPublications && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  Research & Publications
                </h2>
                <p className="text-glass-text-secondary leading-relaxed whitespace-pre-wrap">{profile.researchPublications}</p>
              </motion.div>
            )}

            {profile?.awards && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card"
              >
                <h2 className="text-2xl font-bold text-glass-text-primary mb-4 flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  Awards & Achievements
                </h2>
                <p className="text-glass-text-secondary leading-relaxed whitespace-pre-wrap">{profile.awards}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
