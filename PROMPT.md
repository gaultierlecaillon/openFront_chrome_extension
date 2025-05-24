# Chrome Extension Development Prompt

Create a Chrome extension that displays the population value from openfront.io. Here are the specific requirements and implementation details:

## Task Description

Build a Chrome extension that:
1. Monitors the population value on https://openfront.io/ when a game is started, url should look like https://openfront.io/join/4vdxJBHS where 4vdxJBHS is the id of the game
2. Displays this value in a floating overlay at the top of the page
3. Updates in real-time as the value changes
4. Shows "0" when the game hasn't started or values aren't available or found

## Required Files

Create the following files:

### 1. manifest.json
- Use Manifest V3
- Include permissions for activeTab
- Configure content scripts to run on openfront.io
- Include both JS and CSS files

### 2. styles.css
- Create a fixed-position display at the top center
- Use semi-transparent black background
- Ensure text is white and clearly visible
- Add subtle shadow for depth
- Include smooth transitions for state changes

### 3. content.js
- Create the display element
- Extract population value from the DOM
- Update the display in real-time
- Handle cleanup on page unload

## DOM Structure Reference

The population value can be found in this HTML structure file called 'exemple.html':

## Key Requirements

1. Value Extraction:
   - Use querySelector to find the container with class 'bg-black/30 text-white'
   - Find the flex container that includes "Pop:"
   - Extract the value from the span with attribute 'translate="no"'
   - Return "0" if any step fails or value is invalid

2. Update Mechanism:
   - Set up an interval to check every intervale
   - Clean up resources when page unloads

3. Display:
   - Position at top center of page
   - Use z-index: 9999 to stay on top
   - Semi-transparent background
   - Smooth transitions for changes

4. Error Handling:
   - Return "0" for any missing or invalid values
   - Handle NaN, undefined, and null cases
   - Continue monitoring until valid values appear

## Implementation Steps

1. Create manifest.json with basic extension configuration
2. Create styles.css for display styling
3. Implement content.js:
   - Create display element
   - Set up value extraction
   - Implement update mechanism
   - Add cleanup handlers

## Testing Instructions

1. Load as unpacked extension in Chrome
2. Visit https://openfront.io/
3. Verify:
   - Display shows "0" before game starts
   - Updates when population changes
   - Persists across page interactions
   - Cleans up properly on page reload

## Expected Behavior

- Shows "Population: 0" when game hasn't started
- Updates to actual value once game begins
- Updates continuously as value changes
- Maintains visibility without interfering with game interface
- Removes cleanly when page is unloaded

## Code Style Guidelines

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow Chrome extension best practices
- Ensure efficient DOM operations
- Implement proper resource cleanup

## Performance Considerations

- Minimize DOM queries
- Use efficient selectors
- Clean up intervals and observers
- Handle edge cases gracefully
- Avoid memory leaks
