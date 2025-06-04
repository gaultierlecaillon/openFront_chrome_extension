# OpenFront Chrome Extension

Build a Chrome extension that monitors population on https://openfront.io/ game pages and includes a lofi music player.

## Core Features

1. **Population Tracker**: Display current/total population and percentage in a floating overlay
2. **Auto-hide**: Hide display when population is 0 
3. **Real-time Updates**: Update every 1000ms
4. **Lofi Music Player**: Toggle YouTube lofi stream with character image

## Required Files

### manifest.json
- Manifest V3
- Content scripts for openfront.io
- Web accessible resources for images

### content.js
- Extract population values from DOM
- Calculate percentage: (current/total) * 100
- Hide display when population is 0
- Lofi music toggle with YouTube embed
- Handle SPA navigation

### styles.css
- Fixed position overlay at top center
- Color coding: green (current), amber (total), blue (percentage)
- Lofi container on right side
- Backdrop blur effects

## DOM Structure

Population values are in this format:
```html
<div class="bg-black/30 text-white mb-4 p-2 rounded">
  <div class="flex justify-between mb-1">
    <span class="font-bold">Pop:</span>
    <span translate="no">53.2K / 58.3K</span>
  </div>
</div>
```

## Value Extraction Logic

1. Find container with class `bg-black/30 text-white`
2. Locate span containing "Pop:" 
3. Extract from next span with `translate="no"`
4. Parse format "X.XK / X.XK" using regex: `/(\d+\.?\d*K?)\s*\/\s*(\d+\.?\d*K?)/`
5. Return "0" for both if extraction fails

## Display Format

- **Population Display**: "Population: X.XK / X.XK (XX%)"
- **Lofi Toggle States**: 
  - Play: "Brings the Chill Vibes 🎶"
  - Stop: "Stop, I need to focus 😶"

## File Structure

```
/
├── manifest.json
├── content.js  
├── styles.css
└── img/characters/lofigirl.webp
```

## Update Intervals

- Population updates: 1000ms
- URL change detection: 500ms
- Cleanup on page unload
