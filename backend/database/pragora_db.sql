-- Pragora Database Schema

--DROP TABLE IF EXISTS user_profile CASCADE;
--DROP TABLE IF EXISTS sessions CASCADE;
--DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    --username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Sessions Table
CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
-- Profile Table
CREATE TABLE user_profile (
    user_id INTEGER REFERENCES users(user_id) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    --email VARCHAR(255) UNIQUE NOT NULL,
    --password_hash VARCHAR(60) NOT NULL,
    avatar_img VARCHAR DEFAULT 'default_url',
    about TEXT,
    post_cnt INTEGER DEFAULT 0,
    comment_cnt INTEGER DEFAULT 0,
    upvote_cnt INTEGER DEFAULT 0,
    plan_cnt INTEGER DEFAULT 0,
    plan_comp_cnt INTEGER DEFAULT 0,
    plan_ip_cnt INTEGER DEFAULT 0,
    goals TEXT,
    is_messaging BOOLEAN DEFAULT true,
    is_networking BOOLEAN DEFAULT true,
    reputation_score INTEGER DEFAULT 5,
    reputation_cat VARCHAR(50) DEFAULT 'Newbie',
    interests TEXT,
    credentials VARCHAR,
    expertise_area VARCHAR,
    location VARCHAR(255),
    gender VARCHAR(10),
    sex VARCHAR(1),
    worldview_u VARCHAR,
    worldview_ai VARCHAR,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logon_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user',
    is_admin BOOLEAN DEFAULT false,
    is_instructor BOOLEAN DEFAULT false
);

-- Create post_types table
CREATE TABLE post_types (
    post_type_id SERIAL PRIMARY KEY,
    post_type_name VARCHAR(50) UNIQUE NOT NULL
);
--Insert predefined post types
INSERT INTO post_types (post_type_name) VALUES
('thoughts'),
('image'),
('article'),
('video');

-- Posts Table
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    post_type_id INT NOT NULL REFERENCES post_types(post_type_id), -- Reference table for post types
    title VARCHAR(255),
    subtitle VARCHAR(255),
    content TEXT NOT NULL,
    image_url TEXT,
    caption TEXT,
    video_url TEXT,
    category_id INT REFERENCES categories(category_id),
    subcategory_id INT REFERENCES subcategories(subcategory_id),
    custom_subcategory VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP --ON UPDATE CURRENT_TIMESTAMP
);


-- Categories Table
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    cat_name VARCHAR(100) UNIQUE NOT NULL
);
-- Subcategories Table
CREATE TABLE subcategories (
    subcategory_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category_id INT REFERENCES categories(category_id) ON DELETE CASCADE
);
-- Example tags table for many-to-many relationship
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE NOT NULL
);
-- Junction table for post_tags
CREATE TABLE post_tags (
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Interaction Types for Posts
CREATE TABLE post_interaction_types (
    post_interaction_type_id SERIAL PRIMARY KEY,
    post_interaction_type_name VARCHAR(50) UNIQUE NOT NULL
);

-- Populate Interaction Types for Posts
INSERT INTO post_interaction_types (post_interaction_type_name) VALUES
('like'),
('dislike'),
('love'),
('hate'),
('save'),
('share'),
('report');

-- Interaction Types for Comments
CREATE TABLE comment_interaction_types (
    comment_interaction_types_id SERIAL PRIMARY KEY,
    comment_interaction_types_name VARCHAR(50) UNIQUE NOT NULL
);

-- Populate Interaction Types for Comments
INSERT INTO comment_interaction_types (comment_interaction_types_name) VALUES
('like'),
('dislike'),
('love'),
('hate'),
('save'),
('share'),
('report');

-- User Interactions with Posts
CREATE TABLE post_interactions (
    post_intact_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_id INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    post_interaction_type_id INT NOT NULL REFERENCES post_interaction_types(post_interaction_type_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, post_id, post_interaction_type_id) -- Prevent duplicate interactions
);

-- Comments Table
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_id INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP --ON UPDATE CURRENT_TIMESTAMP
);

-- User Interactions with Comments
CREATE TABLE comment_interactions (
    comment_intact_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    comment_id INT NOT NULL REFERENCES comments(comment_id) ON DELETE CASCADE,
    comment_interaction_types_id INT NOT NULL REFERENCES comment_interaction_types(comment_interaction_types_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, comment_id, comment_interaction_types_id) -- Prevent duplicate interactions
);