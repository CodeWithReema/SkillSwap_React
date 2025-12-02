-- Test Data for SkillSwap
-- Run this after schema.sql to populate the database with test users

-- Insert test users
INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth, university, email_verified)
VALUES 
  ('alice.johnson@university.edu', 'hashed123', 'Alice', 'Johnson', '2002-05-15', 'State University', TRUE),
  ('bob.smith@university.edu', 'hashed123', 'Bob', 'Smith', '2001-08-22', 'State University', TRUE),
  ('charlie.brown@university.edu', 'hashed123', 'Charlie', 'Brown', '2003-02-10', 'Tech University', TRUE),
  ('diana.prince@university.edu', 'hashed123', 'Diana', 'Prince', '2000-11-30', 'State University', TRUE),
  ('emma.watson@university.edu', 'hashed123', 'Emma', 'Watson', '2002-07-18', 'Arts College', TRUE),
  ('frank.miller@university.edu', 'hashed123', 'Frank', 'Miller', '2001-03-25', 'Tech University', TRUE),
  ('grace.hopper@university.edu', 'hashed123', 'Grace', 'Hopper', '2000-12-09', 'State University', TRUE),
  ('henry.ford@university.edu', 'hashed123', 'Henry', 'Ford', '2003-01-14', 'Business School', TRUE);

-- Insert profiles for test users
INSERT INTO profile (user_id, major, year, bio, location, profile_complete)
SELECT user_id, 
  CASE (user_id % 4)
    WHEN 0 THEN 'Computer Science'
    WHEN 1 THEN 'Business Administration'
    WHEN 2 THEN 'Graphic Design'
    ELSE 'Mechanical Engineering'
  END,
  CASE (user_id % 4)
    WHEN 0 THEN 'Junior'
    WHEN 1 THEN 'Senior'
    WHEN 2 THEN 'Sophomore'
    ELSE 'Freshman'
  END,
  CASE (user_id % 4)
    WHEN 0 THEN 'Passionate about software development and AI. Love building web applications and learning new technologies.'
    WHEN 1 THEN 'Business major with focus on entrepreneurship. Looking to network and collaborate on startup ideas.'
    WHEN 2 THEN 'Creative designer specializing in UI/UX. Always looking for new design challenges and collaborations.'
    ELSE 'Engineering student interested in robotics and automation. Seeking study partners and project collaborators.'
  END,
  CASE (user_id % 4)
    WHEN 0 THEN 'Atlanta, Georgia'
    WHEN 1 THEN 'New York, New York'
    WHEN 2 THEN 'Los Angeles, California'
    ELSE 'Chicago, Illinois'
  END,
  TRUE
FROM users
WHERE email LIKE '%@university.edu' OR email LIKE '%@university.edu';

-- Insert user skills
INSERT INTO user_skill (user_id, skill_name, skill_level, offering, seeking)
VALUES
  (1, 'JavaScript', 'Advanced', TRUE, FALSE),
  (1, 'React', 'Intermediate', TRUE, FALSE),
  (1, 'Python', 'Beginner', FALSE, TRUE),
  (2, 'Marketing', 'Advanced', TRUE, FALSE),
  (2, 'Public Speaking', 'Intermediate', TRUE, FALSE),
  (2, 'Data Analysis', 'Beginner', FALSE, TRUE),
  (3, 'Java', 'Advanced', TRUE, FALSE),
  (3, 'Machine Learning', 'Intermediate', TRUE, FALSE),
  (3, 'Web Design', 'Beginner', FALSE, TRUE),
  (4, 'Graphic Design', 'Advanced', TRUE, FALSE),
  (4, 'Photoshop', 'Advanced', TRUE, FALSE),
  (4, 'Video Editing', 'Intermediate', FALSE, TRUE),
  (5, 'Illustration', 'Advanced', TRUE, FALSE),
  (5, 'Digital Art', 'Advanced', TRUE, FALSE),
  (5, '3D Modeling', 'Beginner', FALSE, TRUE),
  (6, 'C++', 'Advanced', TRUE, FALSE),
  (6, 'Embedded Systems', 'Intermediate', TRUE, FALSE),
  (6, 'Mobile Development', 'Beginner', FALSE, TRUE),
  (7, 'Database Design', 'Advanced', TRUE, FALSE),
  (7, 'SQL', 'Advanced', TRUE, FALSE),
  (7, 'Cloud Computing', 'Intermediate', FALSE, TRUE),
  (8, 'Finance', 'Advanced', TRUE, FALSE),
  (8, 'Excel', 'Advanced', TRUE, FALSE),
  (8, 'Programming', 'Beginner', FALSE, TRUE);

-- Insert user interests
INSERT INTO user_interest (user_id, interest_name, category)
VALUES
  (1, 'Tech', 'Technology'),
  (1, 'Gaming', 'Entertainment'),
  (1, 'Hiking', 'Outdoor'),
  (2, 'Business', 'Career'),
  (2, 'Networking', 'Social'),
  (2, 'Reading', 'Hobbies'),
  (3, 'Programming', 'Technology'),
  (3, 'Robotics', 'Technology'),
  (3, 'Sports', 'Fitness'),
  (4, 'Art', 'Creative'),
  (4, 'Photography', 'Creative'),
  (4, 'Music', 'Entertainment'),
  (5, 'Art', 'Creative'),
  (5, 'Drawing', 'Creative'),
  (5, 'Movies', 'Entertainment'),
  (6, 'Engineering', 'Career'),
  (6, 'Cars', 'Hobbies'),
  (6, 'Gaming', 'Entertainment'),
  (7, 'Data Science', 'Technology'),
  (7, 'Research', 'Academic'),
  (7, 'Travel', 'Lifestyle'),
  (8, 'Finance', 'Career'),
  (8, 'Investing', 'Career'),
  (8, 'Golf', 'Sports');

-- Insert user organizations
INSERT INTO user_organization (user_id, organization_name, role)
VALUES
  (1, 'Computer Science Club', 'Member'),
  (1, 'Hackathon Team', 'Participant'),
  (2, 'Business Society', 'Vice President'),
  (2, 'Entrepreneurship Club', 'Member'),
  (3, 'Robotics Club', 'Member'),
  (3, 'Engineering Society', 'Member'),
  (4, 'Design Club', 'President'),
  (4, 'Art Society', 'Member'),
  (5, 'Art Club', 'Treasurer'),
  (5, 'Creative Writing Club', 'Member'),
  (6, 'Engineering Club', 'Member'),
  (6, 'Car Enthusiasts Club', 'Member'),
  (7, 'Data Science Society', 'Secretary'),
  (7, 'Research Group', 'Member'),
  (8, 'Finance Club', 'Member'),
  (8, 'Investment Society', 'Member');

-- Insert profile photos for test users
-- Note: These use placeholder filenames. You can replace these with actual photo files
-- by copying images to the uploads/ directory with these exact filenames.
-- Or use the populate-photos.ps1 script to automatically assign photos.
INSERT INTO profile_photo (profile_id, photo_url, is_primary, uploaded_at)
SELECT 
  p.profile_id,
  '/uploads/' || 
  CASE u.email
    WHEN 'alice.johnson@university.edu' THEN 'alice-profile.jpg'
    WHEN 'bob.smith@university.edu' THEN 'bob-profile.jpg'
    WHEN 'charlie.brown@university.edu' THEN 'charlie-profile.jpg'
    WHEN 'diana.prince@university.edu' THEN 'diana-profile.jpg'
    WHEN 'emma.watson@university.edu' THEN 'emma-profile.jpg'
    WHEN 'frank.miller@university.edu' THEN 'frank-profile.jpg'
    WHEN 'grace.hopper@university.edu' THEN 'grace-profile.jpg'
    WHEN 'henry.ford@university.edu' THEN 'henry-profile.jpg'
    ELSE 'default-profile.jpg'
  END,
  TRUE,
  CURRENT_TIMESTAMP
FROM profile p
JOIN users u ON p.user_id = u.user_id
WHERE u.email LIKE '%@university.edu'
  AND NOT EXISTS (
    SELECT 1 FROM profile_photo pp WHERE pp.profile_id = p.profile_id
  );

