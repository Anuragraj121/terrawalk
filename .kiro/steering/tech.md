---
inclusion: always
name: tech
description: Tech stack and coding conventions
---

Stack: React 18 + TypeScript, Node/Express, PostgreSQL + PostGIS,
       Socket.io, Leaflet.js, Tailwind CSS, JWT auth.

Conventions:
- All API responses: { data, error, meta } shape
- PostGIS queries via ST_Contains / ST_Intersects only (no raw lat/lng math)
- React state: Zustand for global, useState for local component state
- Error handling: always return 4xx/5xx with { error: { code, message } }
- Never hardcode API URLs — use VITE_API_URL env variable
- Write tests for all geospatial utility functions (Vitest)
