# Radio Configuration Guide

This Chrome extension now uses a simplified configuration file (`radio-config.json`) to manage all radio stations. You only need to specify 3 properties per radio - everything else is automatically generated!

## Simplified Configuration

The `radio-config.json` file only requires these 3 properties per radio:

```json
{
  "radios": [
    {
      "name": "Radio Name",
      "character": "character-image.jpg",
      "youtubeUrl": "https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=0"
    }
  ]
}
```

## Required Properties

- **name**: Display name for the radio station
- **character**: Image filename in the `img/characters/` folder
- **youtubeUrl**: YouTube embed URL with autoplay enabled

## Auto-Generated Properties

The extension automatically generates:
- **id**: From the name (lowercase, spaces become dashes)
- **containerClass**: CSS class name (`openfront-{id}-container`)
- **title**: Same as name
- **texts**: Playing/stopped button text
- **state tracking**: Internal state management

## Adding a New Radio Station

1. Add a character image to the `img/characters/` folder
2. Add the image filename to `web_accessible_resources` in `manifest.json`
3. Add the radio to `radio-config.json` with just 3 properties
4. Add CSS styles for the generated container class

### Example: Adding a Jazz Radio

1. Add `jazz_character.png` to `img/characters/`

2. Update `manifest.json`:
```json
"resources": [
  "img/characters/lofigirl.webp",
  "img/characters/phonk_radio.jpg",
  "img/characters/reggaeDub.png",
  "img/characters/jazz_character.png",
  "radio-config.json"
]
```

3. Add to `radio-config.json`:
```json
{
  "name": "Jazz Radio",
  "character": "jazz_character.png",
  "youtubeUrl": "https://www.youtube.com/embed/JAZZ_VIDEO_ID?autoplay=1&mute=0"
}
```

4. Add CSS for `.openfront-jazz-radio-container` in `styles.css`:
```css
.openfront-jazz-radio-container {
  position: fixed;
  top: 500px;  /* Adjust position */
  right: 10px;
  display: flex !important;
  align-items: center;
  gap: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 10000;
  transition: opacity 0.5s ease;
  cursor: pointer;
}

.openfront-jazz-radio-container:hover {
  background-color: rgba(0, 0, 0, 0.9);
}
```

## Modifying Existing Radio Stations

Simply update the properties in `radio-config.json`:

```json
{
  "name": "New Radio Name",
  "character": "new_character.png",
  "youtubeUrl": "https://www.youtube.com/embed/NEW_VIDEO_ID?autoplay=1&mute=0"
}
```

## Removing a Radio Station

Remove the radio object from the `radios` array in `radio-config.json`.

## YouTube URL Format

```
https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=0
```

- Replace `VIDEO_ID` with the actual YouTube video ID
- `autoplay=1` enables automatic playback
- `mute=0` ensures audio is not muted

## Benefits

1. **Minimal Configuration**: Only 3 properties needed per radio
2. **Auto-Generation**: IDs, classes, and text automatically created
3. **Easy Management**: No code changes required
4. **Consistent Naming**: Automatic naming conventions
5. **Scalable**: Add unlimited radios easily

## CSS Class Name Generation

Radio names are converted to CSS classes automatically:
- "Lofi Radio" → `.openfront-lofi-radio-container`
- "Jazz Music" → `.openfront-jazz-music-container`
- "Rock FM" → `.openfront-rock-fm-container`

## Troubleshooting

- Ensure image files exist in `img/characters/`
- Verify YouTube URLs are properly formatted
- Check that CSS classes match generated names
- Reload the extension after configuration changes
