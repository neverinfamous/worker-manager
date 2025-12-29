-- Worker Manager D1 Schema
-- Version: 1.0.0

-- Metadata for Workers (shadow registry)
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    script_name TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    color TEXT,
    notes TEXT
);

-- Metadata for Pages projects (shadow registry)
CREATE TABLE IF NOT EXISTS pages_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    subdomain TEXT,
    production_branch TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    color TEXT,
    notes TEXT
);

-- Job history tracking
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    operation_type TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('worker', 'page')),
    entity_id TEXT,
    entity_name TEXT,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    item_count INTEGER DEFAULT 0 CHECK (item_count >= 0),
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    error_message TEXT,
    user_email TEXT
);

-- Job events for detailed tracking
CREATE TABLE IF NOT EXISTS job_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    message TEXT,
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Webhook configurations
CREATE TABLE IF NOT EXISTS webhooks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT NOT NULL, -- JSON array of event types
    secret TEXT,
    enabled INTEGER DEFAULT 1 CHECK (enabled IN (0, 1)),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- R2 backup records
CREATE TABLE IF NOT EXISTS backups (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('worker', 'page')),
    entity_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    backup_type TEXT NOT NULL CHECK (backup_type IN ('manual', 'pre_delete', 'scheduled')),
    size_bytes INTEGER DEFAULT 0 CHECK (size_bytes >= 0),
    created_at TEXT DEFAULT (datetime('now')),
    created_by TEXT
);

-- Schema migrations tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT DEFAULT (datetime('now'))
);

-- Record initial migration
INSERT OR IGNORE INTO schema_migrations (version, name) VALUES (1, 'initial_schema');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workers_name ON workers(name);
CREATE INDEX IF NOT EXISTS idx_workers_updated ON workers(updated_at);

CREATE INDEX IF NOT EXISTS idx_pages_projects_name ON pages_projects(name);
CREATE INDEX IF NOT EXISTS idx_pages_projects_updated ON pages_projects(updated_at);

CREATE INDEX IF NOT EXISTS idx_jobs_entity ON jobs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_started ON jobs(started_at);

CREATE INDEX IF NOT EXISTS idx_job_events_job ON job_events(job_id);
CREATE INDEX IF NOT EXISTS idx_job_events_timestamp ON job_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_backups_entity ON backups(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_backups_created ON backups(created_at);

CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(enabled);
