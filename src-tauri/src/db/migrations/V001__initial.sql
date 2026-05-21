CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY NOT NULL,
    provider_id TEXT NOT NULL,
    label TEXT NOT NULL,
    encrypted_value BLOB NOT NULL,
    nonce BLOB NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    base_url TEXT,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    models TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY NOT NULL,
    group_id TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    granted INTEGER NOT NULL DEFAULT 0,
    level TEXT NOT NULL DEFAULT 'moderate',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plugins (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    is_enabled INTEGER NOT NULL DEFAULT 0,
    is_installed INTEGER NOT NULL DEFAULT 0,
    required_permissions TEXT NOT NULL DEFAULT '[]',
    installed_at TEXT
);

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    personality TEXT NOT NULL,
    model TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT 'bg-brand-600',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS memory_entries (
    id TEXT PRIMARY KEY NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    resource TEXT,
    result TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS telegram_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    bot_token_encrypted BLOB,
    bot_token_nonce BLOB,
    bot_username TEXT,
    allowed_user_id TEXT,
    is_connected INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed default config
INSERT OR IGNORE INTO config (key, value) VALUES ('theme', '"dark"');
INSERT OR IGNORE INTO config (key, value) VALUES ('auto_start', 'false');
INSERT OR IGNORE INTO config (key, value) VALUES ('minimize_to_tray', 'true');
INSERT OR IGNORE INTO config (key, value) VALUES ('auto_update', 'true');
INSERT OR IGNORE INTO config (key, value) VALUES ('telemetry_enabled', 'false');
INSERT OR IGNORE INTO config (key, value) VALUES ('active_profile', '"default"');

-- Seed default profile
INSERT OR IGNORE INTO profiles (id, name, description, personality, model, is_active, color)
VALUES ('default', 'Default', 'General-purpose assistant', 'Helpful, concise, and technical', 'claude-sonnet-4-6', 1, 'bg-brand-600');
