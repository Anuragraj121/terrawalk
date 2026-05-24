# Requirements — TerraWalk

## User stories

### US-1: Start a walk session
As a user, I want to start a GPS tracking session
so that my movement is recorded and territory is claimed in real time.

WHEN the user taps "Start Walk"
THE SYSTEM SHALL request location permission, initialise GPS tracking,
and begin rendering the user's path on the live map.

WHEN the user moves through an unclaimed 1km² grid cell
THE SYSTEM SHALL colour that cell in the user's assigned colour
and increment their territory count.

WHEN the user moves through a cell claimed by another user
THE SYSTEM SHALL transfer ownership to the current user
and notify the previous owner via push notification.

### US-2: View the territory map
As a user, I want to see a live map with all claimed territories
so that I can plan my next route strategically.

WHEN the map screen is opened
THE SYSTEM SHALL render all claimed grid cells with owner colours
and show the user's current location as a pulsing dot.

WHEN the user taps a cell
THE SYSTEM SHALL display the owner name, claim date, and cell size.

### US-3: Leaderboard
As a user, I want to see a global and friends leaderboard
so that I can compare my territory against others.

WHEN the user opens the leaderboard tab
THE SYSTEM SHALL display top 100 users ranked by total km² claimed,
refreshed every 60 seconds.

### US-4: Session summary
As a user, I want a post-session summary
so that I can review my performance.

WHEN the user taps "End Walk"
THE SYSTEM SHALL display distance walked, duration, cells claimed,
cells stolen from others, and cells lost to others.

### US-5: User profile & stats
As a user, I want a profile page with my territory stats
so that I can track my progress over time.

WHEN the user visits their profile
THE SYSTEM SHALL show total territory (km²), total sessions,
total distance walked, and a mini heatmap of their captured zones.
