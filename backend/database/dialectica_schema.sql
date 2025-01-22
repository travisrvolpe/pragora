-- Refined SQL script for Dialectica platform schema

-- USERS TABLE
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(60) NOT NULL,
    avatar_img VARCHAR DEFAULT 'default_url',
    about TEXT,
    post_cnt INTEGER DEFAULT 0,
    comment_cnt INTEGER DEFAULT 0,
    upvote_cnt INTEGER DEFAULT 0,
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
    role VARCHAR(50) DEFAULT 'user',
    is_admin BOOLEAN DEFAULT false,
    is_instructor BOOLEAN DEFAULT false
);

-- TOPIC TABLE
CREATE TABLE topic (
    topic_id SERIAL PRIMARY KEY,
    topic_name VARCHAR(255) UNIQUE NOT NULL
);

-- POSTS TABLE
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    post_body TEXT,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topic(topic_id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    char_count INTEGER,
    post_type VARCHAR(50),
    is_draft BOOLEAN DEFAULT false
);

-- COMMENTS TABLE
CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    comment_body TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES comments(comment_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    comment_type VARCHAR(50)
);

-- JOURNAL TABLE
CREATE TABLE journal (
    journal_id SERIAL PRIMARY KEY,
    journal_body TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- ADDITIONAL INDEXES FOR PERFORMANCE
CREATE INDEX idx_posts_topic_id ON posts(topic_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
