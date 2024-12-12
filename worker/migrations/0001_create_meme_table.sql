-- Migration number: 0001 	 2024-12-11T23:59:58.072Z
CREATE TABLE meme(
    id VARCHAR(36) PRIMARY KEY,
    description VARCHAR(1024) NOT NULL,
    keywords VARCHAR(512),
    user_id VARCHAR(36),
    file VARCHAR(512),
    type VARCHAR(32),
    width INTEGER,
    height INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meme_user_id ON meme(user_id);
