-- Migration: Add new profile fields and user_language table
-- Run this if you have an existing database and don't want to drop/recreate

-- Add new columns to profile table
ALTER TABLE profile ADD COLUMN IF NOT EXISTS career VARCHAR(255);
ALTER TABLE profile ADD COLUMN IF NOT EXISTS career_experience TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS research_publications TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS awards TEXT;

-- Create user_language table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_language (
    language_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    language_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50)
);

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_language_userid ON user_language(user_id);

