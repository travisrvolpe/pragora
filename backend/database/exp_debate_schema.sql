CREATE TABLE "debates" (
  "debate_id" BIGINT PRIMARY KEY,
  "content_id" BIGINT NOT NULL, -- Links to main content table
  "debate_type" VARCHAR(50) NOT NULL, -- 'structured', 'oxford', 'dialectical', 'pragma_dialectical', 'peer_review'
  "status" VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'concluded', 'archived'
  "resolution" TEXT NOT NULL,
  "context" TEXT,
  "rules" JSONB, -- Format-specific rules
  "participant_requirements" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "concluded_at" TIMESTAMP,
  "winner_side" VARCHAR(50), -- Can be null for some formats
  FOREIGN KEY (content_id) REFERENCES content(content_id)
);

CREATE TABLE "debate_participants" (
  "debate_id" BIGINT,
  "user_id" BIGINT,
  "role" VARCHAR(50), -- 'proposer', 'opponent', 'moderator', 'judge', 'contributor'
  "side" VARCHAR(50), -- 'affirmative', 'negative', null for neutral roles
  "status" VARCHAR(50) DEFAULT 'active',
  "joined_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (debate_id, user_id, role),
  FOREIGN KEY (debate_id) REFERENCES debates(debate_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE "debate_rounds" (
  "round_id" BIGINT PRIMARY KEY,
  "debate_id" BIGINT,
  "round_number" INT,
  "round_type" VARCHAR(50), -- 'opening', 'rebuttal', 'cross_examination', 'closing'
  "status" VARCHAR(50) DEFAULT 'pending',
  "start_time" TIMESTAMP,
  "end_time" TIMESTAMP,
  "time_limit" INT, -- in minutes
  "speaker_side" VARCHAR(50),
  FOREIGN KEY (debate_id) REFERENCES debates(debate_id)
);

CREATE TABLE "debate_arguments" (
  "argument_id" BIGINT PRIMARY KEY,
  "round_id" BIGINT,
  "user_id" BIGINT,
  "parent_argument_id" BIGINT,
  "argument_type" VARCHAR(50), -- 'claim', 'premise', 'evidence', 'rebuttal', 'question', 'answer'
  "content" TEXT NOT NULL,
  "sources" JSONB,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "logic_score" DECIMAL(5,2),
  "evidence_score" DECIMAL(5,2),
  "relevance_score" DECIMAL(5,2),
  FOREIGN KEY (round_id) REFERENCES debate_rounds(round_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (parent_argument_id) REFERENCES debate_arguments(argument_id)
);

CREATE TABLE "argument_evaluations" (
  "evaluation_id" BIGINT PRIMARY KEY,
  "argument_id" BIGINT,
  "evaluator_id" BIGINT,
  "evaluation_type" VARCHAR(50), -- 'logic', 'evidence', 'relevance', 'fallacy'
  "score" DECIMAL(5,2),
  "reasoning" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (argument_id) REFERENCES debate_arguments(argument_id),
  FOREIGN KEY (evaluator_id) REFERENCES users(user_id)
);

CREATE TABLE "debate_fallacies" (
  "fallacy_id" BIGINT PRIMARY KEY,
  "argument_id" BIGINT,
  "reporter_id" BIGINT,
  "fallacy_type" VARCHAR(100),
  "explanation" TEXT,
  "status" VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected'
  "created_at" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (argument_id) REFERENCES debate_arguments(argument_id),
  FOREIGN KEY (reporter_id) REFERENCES users(user_id)
);

-- Indices for performance
CREATE INDEX idx_debates_type ON debates(debate_type);
CREATE INDEX idx_debates_status ON debates(status);
CREATE INDEX idx_arguments_round ON debate_arguments(round_id);
CREATE INDEX idx_arguments_parent ON debate_arguments(parent_argument_id);