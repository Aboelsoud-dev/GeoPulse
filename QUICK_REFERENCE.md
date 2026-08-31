# GeoPulse Quick Reference Guide

## 🚀 Launch
```bash
cd /workspaces/GeoPulse
python3 -m http.server 4173
# Open http://127.0.0.1:4173
```

## ⌨️ Essential Keyboard Shortcuts
```
?           Show this help
/           Focus search box
Ctrl+K      Command palette
Ctrl+S      Go to settings
Ctrl+W      Go to watchlist
G           Go to map
A           Go to alerts
T           Toggle dark/light theme
R           Refresh live data
```

## 🔍 Search Tips
- **Global Search** (`/`): Find countries, alerts, intelligence anywhere
- **Feed Filter**: Type in intelligence feed to search by title/region
- **Alert Filter**: Dropdown to filter by risk level (Critical/High/Moderate)
- Results update as you type

## 🗺️ Map Navigation
1. Click any country to see details
2. Risk score shown with color: 🟡 (0-54) → 🟠 (55-79) → 🔴 (80-100)
3. Hover to see risk score
4. Related countries shown in detail modal

## ⭐ Watchlist
- Add countries via map detail modal
- Remove countries with "Remove" button
- Export as JSON: Click "Export watchlist" button
- Data persists across sessions

## 🎛️ Settings
- **Change Identity**: Update your analyst name
- **Theme**: Toggle dark/light mode
- **Reset Onboarding**: Replay intro sequence
- **Reset Local Data**: Clear all saved data

## 💡 Pro Tips
1. Press `R` for manual data refresh (simulated intelligence updates every 8 seconds)
2. Use keyboard shortcuts for fast navigation
3. Search across all sections with global search
4. Export watchlist before resetting to back up your list
5. Try both light and dark themes - press `T`

## 🎯 Quick Workflows
**Find Crisis Updates**
- Press `/` → Search "Ukraine" or "Eastern Europe"
- Check risk filter for your region
- Click to see detail

**Monitor Watchlist**
- Ctrl+W to jump to watchlist
- See all monitored countries
- Export to share with team

**Check Critical Alerts**
- Press `A` to jump to alerts
- Select "Critical" in filter dropdown
- Review high-priority intelligence

## 📊 Dashboard Sections
| Section | Keyboard | Content |
|---------|----------|---------|
| Map | G | Interactive world map with risk scores |
| Alerts | A | Filtered by risk level |
| Feed | / | Intelligence updates, searchable |
| Situation Room | Ctrl+K | Political tension metrics |
| Watchlist | Ctrl+W | Your monitored countries |
| Settings | Ctrl+S | Preferences & data management |

## 🎨 Color Legend
- 🟡 **Yellow** (0-54): Watch level risk
- 🟠 **Orange** (55-79): Elevated risk
- 🔴 **Red** (80-100): Critical risk

## 💾 What Gets Saved
- Your analyst name
- Theme preference (dark/light)
- Your watchlist
- Alert read/unread status

All saved locally - no server required!

## 🐛 Troubleshooting
**Search not working?**
- Make sure search box is focused (press `/`)
- Clear search box to see all results

**Data not updating?**
- Press `R` to manually refresh
- Auto-updates every 8 seconds

**Theme looks wrong?**
- Try toggling with `T` key
- Refresh page to reload theme

**Lost your watchlist?**
- Export before resetting!
- Settings → Reset Data clears everything

## 📖 Get Help Anytime
- Press `?` for keyboard shortcuts cheat sheet
- This guide also in FEATURES_IMPLEMENTED.md
- Button help available throughout UI

---

**Ready to analyze? Start with `/` to search, or `G` to view the map!** 🎯

