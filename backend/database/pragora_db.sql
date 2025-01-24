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

-- Posts Table
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);