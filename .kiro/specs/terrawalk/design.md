# Design — TerraWalk

## Architecture overview

```
Client (React/TS PWA)
  └── Leaflet map + Socket.io client
        │
        ▼
API Server (Node/Express)
  ├── REST: /auth, /users, /sessions, /leaderboard
  └── WebSocket (Socket.io): territory-update events
        │
        ▼
PostgreSQL + PostGIS (Docker)
  ├── users, sessions, territory_cells
  └── Spatial index on cell geometry
```

## Data models

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| username | TEXT | UNIQUE |
| email | TEXT | UNIQUE |
| password_hash | TEXT | bcrypt |
| colour | CHAR(7) | hex colour |
| total_cells | INT | default 0 |
| created_at | TIMESTAMP | |

### sessions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK users |
| started_at | TIMESTAMP | |
| ended_at | TIMESTAMP | nullable |
| distance_m | FLOAT | |
| cells_claimed | INT | default 0 |
| cells_stolen | INT | default 0 |
| cells_lost | INT | default 0 |

### territory_cells
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| geom | GEOMETRY(Polygon, 4326) | PostGIS |
| cell_key | TEXT | UNIQUE, e.g. "28.12:79.04" |
| owner_id | UUID | FK users |
| claimed_at | TIMESTAMP | |
| last_contested_at | TIMESTAMP | nullable |

## Grid system
- Divide world into 0.01° × 0.01° cells (~1km²)
- cell_key = floor(lat/0.01)*0.01 : floor(lng/0.01)*0.01
- PostGIS ST_Contains used to check cell membership

## Real-time flow
1. Client emits `location-update` every 3 seconds via Socket.io
2. Server checks if new cell — queries territory_cells by cell_key
3. If unclaimed → INSERT, emit `cell-claimed` to all clients in viewport
4. If owned by other → UPDATE owner_id, emit `cell-stolen` to all
5. Previous owner receives `cell-lost` push event

## API routes
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Get JWT tokens |
| POST | /api/auth/refresh | Refresh access token |
| GET | /api/cells?bbox=minLat,minLng,maxLat,maxLng | Cells in viewport |
| POST | /api/sessions/start | Begin session |
| POST | /api/sessions/end/:id | End session, get summary |
| GET | /api/leaderboard?type=global\|friends&page=1 | Leaderboard |
| GET | /api/users/:id/stats | User profile stats |

## Component tree
```
App
├── MapScreen
│   ├── LeafletMap (territory layer, user dot)
│   ├── SessionControls (Start/Stop button)
│   └── ActiveSessionStats (live km², cells)
├── LeaderboardScreen
├── ProfileScreen
└── SessionSummaryModal
```
