CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL CHECK (length(full_name) BETWEEN 1 AND 80),
  email TEXT NOT NULL UNIQUE CHECK (length(email) <= 254),
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  preferred_day TEXT NOT NULL CHECK (preferred_day IN ('Saturday', 'Sunday', 'Weekdays')),
  interests TEXT NOT NULL DEFAULT '',
  comments TEXT NOT NULL DEFAULT '' CHECK (length(comments) <= 500),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
