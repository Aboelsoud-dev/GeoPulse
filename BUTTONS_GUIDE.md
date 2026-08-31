# GeoPulse Button Functionality Guide

## All Buttons Now Active & Dynamic

### 🎯 Navigation & Top Bar
- **Sidebar Navigation Links** (Overview, Situation Room, Developments, Watchlist, Settings)
  - Smooth scroll to corresponding sections
  - Active state indicator on current view
  
- **Command Palette Button** (⌘ K)
  - Opens/closes command palette with keyboard shortcut (Ctrl/Cmd + K)
  - Click to toggle or press Escape to close
  
- **Notifications Bell** (♢)
  - Displays count of unread alerts
  - Click to jump to Alerts section
  - Shows unread count dynamically

### 📊 Dashboard Actions
- **Export Brief** (↓ Export brief)
  - Generates and downloads intelligence briefing as .txt file
  - Includes date, analyst name, global tension index, key changes, and top alerts
  - Visual feedback with opacity change during export
  
- **Profile Menu** (•••)
  - Click to open profile options
  - Change identity/name from profile menu
  - Updates greeting and sidebar profile card

### 🗺️ Map & Risk Section
- **Map Controls** (Tension, Events, Expand)
  - Tension/Events: Toggles between data layers
  - Expand (⤢): Full intelligence map button
  - All update the map display dynamically
  
- **Country Risk List**
  - Click any country to select and view detailed risk panel
  - Scrolls to map when selected
  
- **More Options** (•••) in Risk Monitor
  - Scrolls to risk list for detailed view
  - Shows available monitoring options

### 📰 Feed & Alerts
- **See All** (Recent developments)
  - Scrolls to full intelligence feed section
  - Shows all recent activity and alerts
  
- **Mark Read** (Alert buttons)
  - Toggle read/unread status for each alert
  - Updates notification badge count
  - Visual indicator for read alerts
  
- **View Full Map** (Map footer)
  - Expands and centers the global activity map
  - Smooth scroll animation

### 🎛️ Trending & Regions
- **Filter Button** (7D ⌄)
  - Cycles through time ranges: 7D → 30D → 90D → All
  - Updates trend data display
  - Shows current filter period

### 🔧 Settings Panel
- **Change Identity**
  - Prompt to update analyst name
  - Updates greeting, sidebar profile, and all personalization
  - Name persists in localStorage
  
- **Reset Onboarding**
  - Clears user name from storage
  - Reloads page to show onboarding again
  
- **Reset Local Data**
  - Clears both user name and watchlist
  - Full reset of application state

### ⭐ Watchlist
- **Remove** (buttons on each country)
  - Removes country from watchlist
  - Updates localStorage
  - Live re-renders watchlist
  - Default: Ukraine, Taiwan, Israel, Egypt

### 🎮 Form & Interactive
- **Access GEOPULSE** (Onboarding submit)
  - Submits identity form
  - Stores name in localStorage
  - Personalizes dashboard and closes onboarding

## Dynamic Behaviors
✅ All buttons provide visual feedback (hover, click effects)
✅ Tooltip updates on button interactions
✅ Smooth scroll animations for navigation
✅ Real-time state updates (alerts, watchlist)
✅ Persistent data in localStorage
✅ Keyboard shortcuts (Ctrl/Cmd + K for command palette)
✅ Modal confirmations for destructive actions
✅ Dynamic notification badges

## Testing the Buttons
1. Open http://127.0.0.1:4173 in browser
2. Complete onboarding with a name
3. Try clicking buttons:
   - ⌘ K for command palette
   - ♢ for alerts
   - ↓ to export briefing
   - Click countries on the map
   - Toggle filters and time ranges
4. All interactions update state dynamically

