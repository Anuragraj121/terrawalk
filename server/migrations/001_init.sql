CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  colour CHAR(7) NOT NULL,
  total_cells INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  started_at TIMESTAMP DEFAULT now(),
  ended_at TIMESTAMP,
  distance_m FLOAT DEFAULT 0,
  cells_claimed INT DEFAULT 0,
  cells_stolen INT DEFAULT 0,
  cells_lost INT DEFAULT 0
);

CREATE TABLE territory_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geom GEOMETRY(Polygon, 4326) NOT NULL,
  cell_key TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id) NOT NULL,
  claimed_at TIMESTAMP DEFAULT now(),
  last_contested_at TIMESTAMP
);

CREATE INDEX idx_cells_owner ON territory_cells(owner_id);
CREATE INDEX idx_cells_geom ON territory_cells USING GIST(geom);
CREATE INDEX idx_cells_key ON territory_cells(cell_key);
CREATE INDEX idx_sessions_user ON sessions(user_id);
