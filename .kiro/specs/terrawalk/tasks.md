# Tasks — TerraWalk

## Wave 1 — Foundation ✅
- [x] 1.1 Initialise React + TypeScript + Tailwind project (PWA)
- [x] 1.2 Set up Node/Express server with TypeScript
- [x] 1.3 Docker Compose: PostgreSQL + PostGIS
- [x] 1.4 Create DB migration: users, sessions, territory_cells tables
- [x] 1.5 Implement JWT auth (register, login, refresh token)

## Wave 2 — Map & GPS ✅
- [x] 2.1 Integrate Leaflet.js with OpenStreetMap tiles
- [x] 2.2 Implement browser Geolocation API polling (3s interval)
- [x] 2.3 Build grid cell calculation utility (lat/lng → cell_key)
- [x] 2.4 Render claimed cells as coloured GeoJSON polygons on map
- [x] 2.5 Add user location dot with accuracy circle

## Wave 3 — Territory engine ✅
- [x] 3.1 POST /api/sessions/start — create session record
- [x] 3.2 Cell claim logic: insert or transfer ownership in DB
- [x] 3.3 Socket.io server — emit cell-claimed / cell-stolen events
- [x] 3.4 Socket.io client — update map layer on incoming events
- [x] 3.5 GET /api/cells?bbox — return cells for current viewport

## Wave 4 — Sessions & Stats ✅
- [x] 4.1 POST /api/sessions/end — compute summary stats
- [x] 4.2 Session summary modal (distance, claimed, stolen, lost)
- [x] 4.3 User profile screen with lifetime stats

## Wave 5 — Leaderboard & Social ✅
- [x] 5.1 GET /api/leaderboard global (top 100 by total_cells)
- [x] 5.2 Leaderboard screen with ranked list
- [x] 5.3 Load existing territory cells from API on viewport change

## Wave 6 — Polish & Deploy ✅
- [x] 6.1 Mobile-responsive UI pass (safe areas, touch gestures)
- [x] 6.2 Anti-cheat: reject location updates with speed > 60 km/h
- [x] 6.3 Full Docker Compose (app + client + db)
