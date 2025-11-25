--  SkillSwap Database Schema


-- Drop existing tables in correct order to avoid FK errors (for local resets)
DROP TABLE IF EXISTS message, match, swipe,
    user_organization, user_interest, user_skill, skills,
    profile_photo, profile, users CASCADE;


-- USERS

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    university VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);


-- PROFILE

CREATE TABLE profile (
    profile_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    major VARCHAR(255),
    year VARCHAR(50),
    bio TEXT,
    location VARCHAR(255),
    career_goals TEXT,
    availability VARCHAR(100),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    portfolio VARCHAR(255),
    career VARCHAR(255),
    career_experience TEXT,
    research_publications TEXT,
    awards TEXT,
    profile_complete BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- PROFILE_PHOTO

CREATE TABLE profile_photo (
    photo_id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profile(profile_id) ON DELETE CASCADE,
    photo_url VARCHAR(255),
    is_primary BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SKILL
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE,
    skill_category VARCHAR(100),
    description TEXT
);


-- USER_SKILL

CREATE TABLE user_skill (
    skill_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    skill_name VARCHAR(255) NOT NULL,
    skill_level VARCHAR(100),
    offering BOOLEAN DEFAULT FALSE,
    seeking BOOLEAN DEFAULT FALSE
);


CREATE INDEX idx_user_skill_userid ON user_skill(user_id);


-- USER_INTEREST

CREATE TABLE user_interest (
    interest_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    interest_name VARCHAR(255) NOT NULL,
    category VARCHAR(100)
);

CREATE INDEX idx_user_interest_userid ON user_interest(user_id);


-- USER_ORGANIZATION

CREATE TABLE user_organization (
    org_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    role VARCHAR(100)
);


CREATE INDEX idx_user_organization_userid ON user_organization(user_id);

-- USER_LANGUAGE
CREATE TABLE IF NOT EXISTS user_language (
    language_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    language_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_user_language_userid ON user_language(user_id);

-- SWIPE

CREATE TABLE swipe (
    swipe_id SERIAL PRIMARY KEY,
    swiper_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    swipee_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    is_like BOOLEAN DEFAULT FALSE,
    swiped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_swipe UNIQUE (swiper_id, swipee_id)
);


CREATE INDEX idx_swipe_swiper ON swipe(swiper_id);
CREATE INDEX idx_swipe_swipee ON swipe(swipee_id);


-- MATCH

CREATE TABLE match (
    match_id SERIAL PRIMARY KEY,
    user1_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    user2_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_match UNIQUE (user1_id, user2_id)
);

CREATE INDEX idx_match_user1 ON match(user1_id);
CREATE INDEX idx_match_user2 ON match(user2_id);

-- MESSAGE

CREATE TABLE message (
    message_id SERIAL PRIMARY KEY,
    match_id INT REFERENCES match(match_id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_message_matchid ON message(match_id);
CREATE INDEX idx_message_senderid ON message(sender_id);


-- Default test users to test every table
INSERT INTO users (email, password_hash, first_name, last_name, university, email_verified)
VALUES 
  ('test@example.com', '12345', 'Test', 'User', 'MGA', TRUE),
  ('test2@example.com', '12345', 'Second', 'User', 'MGA', TRUE);
