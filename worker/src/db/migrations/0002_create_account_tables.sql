-- Migration number: 0002 	 2025-01-05T20:28:58.612Z
CREATE TABLE account(
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session(
    id VARCHAR(36) PRIMARY KEY,
    refresh_id VARCHAR(36),
    account_id VARCHAR(36) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(account_id) REFERENCES account(id)
);

ALTER TABLE meme RENAME COLUMN user_id TO account_id;
