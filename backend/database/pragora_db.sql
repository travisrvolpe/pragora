-- Pragora Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Profile Table
CREATE TABLE IF NOT EXISTS user_profile (
    user_id INTEGER REFERENCES users(user_id) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    avatar_img VARCHAR DEFAULT 'default_url',
    about TEXT,
    post_cnt INTEGER DEFAULT 0,
    comment_cnt INTEGER DEFAULT 0,
    upvote_cnt INTEGER DEFAULT 0,
    plan_cnt INTEGER DEFAULT 0,
    plan_comp_cnt INTEGER DEFAULT 0,
    plan_ip_cnt INTEGER DEFAULT 0,
    goals TEXT,
    is_messaging BOOLEAN DEFAULT TRUE,
    is_networking BOOLEAN DEFAULT TRUE,
    reputation_score INTEGER DEFAULT 5,
    reputation_cat VARCHAR(50) DEFAULT 'Newbie',
    interests TEXT,
    credentials VARCHAR(255),
    expertise_area VARCHAR(255),
    location VARCHAR(255),
    gender VARCHAR(10),
    sex CHAR(1),
    worldview_u VARCHAR(255),
    worldview_ai VARCHAR(255),
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logon_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    is_instructor BOOLEAN DEFAULT FALSE
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    content TEXT NOT NULL,
    image_url JSON,
    caption TEXT,
    video_url TEXT,
    post_type_id INTEGER NOT NULL,
    category_id INTEGER,
    subcategory_id INTEGER,
    custom_subcategory VARCHAR(100),
    likes_count INTEGER DEFAULT 0,
    dislikes_count INTEGER DEFAULT 0,
    loves_count INTEGER DEFAULT 0,
    hates_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    reports_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Post Types Table
CREATE TABLE IF NOT EXISTS post_types (
    post_type_id SERIAL PRIMARY KEY,
    post_type_name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert predefined post types
INSERT INTO post_types (post_type_name) VALUES
('thoughts'),
('image'),
('article'),
('video') ON CONFLICT DO NOTHING;

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100) UNIQUE NOT NULL
);

-- Junction table for post_tags
CREATE TABLE IF NOT EXISTS post_tags (
    post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Saved Posts Many-to-Many Relationship
CREATE TABLE IF NOT EXISTS saved_posts (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(post_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, post_id)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    cat_name VARCHAR(100) UNIQUE NOT NULL
);

-- Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
    subcategory_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Post Interaction Types
CREATE TABLE IF NOT EXISTS post_interaction_types (
    post_interaction_type_id SERIAL PRIMARY KEY,
    post_interaction_type_name VARCHAR(50) UNIQUE NOT NULL
);

-- Populate Post Interaction Types
INSERT INTO post_interaction_types (post_interaction_type_name) VALUES
('like'),
('dislike'),
('love'),
('hate'),
('save'),
('share'),
('report') ON CONFLICT DO NOTHING;

-- Post Interactions Table
CREATE TABLE IF NOT EXISTS post_interactions (
    post_intact_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_id INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    post_interaction_type_id INT NOT NULL REFERENCES post_interaction_types(post_interaction_type_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, post_id, post_interaction_type_id)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    comment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_id INT NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comment Interaction Types
CREATE TABLE IF NOT EXISTS comment_interaction_types (
    comment_interaction_types_id SERIAL PRIMARY KEY,
    comment_interaction_types_name VARCHAR(50) UNIQUE NOT NULL
);

-- Populate Comment Interaction Types
INSERT INTO comment_interaction_types (comment_interaction_types_name) VALUES
('like'),
('dislike'),
('love'),
('hate'),
('save'),
('share'),
('report') ON CONFLICT DO NOTHING;

-- Comment Interactions Table
CREATE TABLE IF NOT EXISTS comment_interactions (
    comment_intact_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    comment_id INT NOT NULL REFERENCES comments(comment_id) ON DELETE CASCADE,
    comment_interaction_types_id INT NOT NULL REFERENCES comment_interaction_types(comment_interaction_types_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, comment_id, comment_interaction_types_id)
);
