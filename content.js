// Audio data and alert functions are loaded from audioData.js and alert.js

// State tracking
let hasPassedSixtyPercent = false;
let hasPassedSeventyPercent = false;
let hasPassedStartThreshold = false;
let isExtensionEnabled = false; // Extension is disabled by default

// Track recently played sounds to avoid repetition
let recentlyPlayedSounds = [];
const MAX_RECENT_SOUNDS = Math.min(5, Math.floor(soundFiles.length / 2)); // Keep track of up to 5 recent sounds or half the total

// Track sound interval ID for clearing
let soundIntervalId;

/**
 * Plays a specific sound file
 * @param {string} soundFile - The sound file to play
 */
function playSpecificSound(soundFile) {
    const audio = new Audio(chrome.runtime.getURL(`mp3/${soundFile}`));
    
    // Extract character name and title
    const parts = soundFile.split('_');
    let characterName = '';
    let title = soundFile;
    
    if (parts.length > 1) {
        characterName = parts[0];
        title = parts.slice(1).join('_');
    }
    
    // Update character container and image
    const characterImg = characterContainer.querySelector('.openfront-character-image');
    const audioTitle = characterContainer.querySelector('.openfront-audio-title');
    
    if (characterImg && audioTitle) {
        // Remove fade-out class if present
        characterContainer.classList.remove('fade-out');
        
        // Show container and update image
        characterContainer.style.display = characterName ? 'flex' : 'none';
        characterImg.src = chrome.runtime.getURL(`img/characters/${characterName}.webp`);
        characterImg.style.display = characterName ? 'block' : 'none';
        
        // Get audio-specific text or use default
        const audioText = audioTexts[soundFile] || title.replace('.mp3', '');
        
        // Create typing animation container
        audioTitle.innerHTML = `<span class="typing-text">${audioText}</span>`;
        
        // Play audio and get duration
        audio.addEventListener('loadedmetadata', () => {
            // Set typing animation duration to match audio duration
            const typingElement = audioTitle.querySelector('.typing-text');
            if (typingElement) {
                const audioDuration = audio.duration;
                const typingDuration = audioDuration * 0.9; // 90% of audio duration
                typingElement.style.animation = `typing ${typingDuration}s steps(${audioText.length * 2}, end), blink-caret 0.75s step-end infinite`;
            }
        });
        
        // Add event listener to hide container when audio ends (with 5s delay)
        audio.addEventListener('ended', () => {
            // Wait 5 seconds before starting fade-out
            setTimeout(() => {
                // Add fade-out class to smoothly hide the container
                characterContainer.classList.add('fade-out');
                
                // Hide container after fade-out animation completes
                setTimeout(() => {
                    characterContainer.style.display = 'none';
                }, 500); // Match the transition duration in CSS
            }, 5000); // 5 second delay before hiding
        });
    }
    
    audio.play().catch(error => console.error('Error playing sound:', error));
}

/**
 * Plays a random sound with improved randomization
 */
function playRandomSound() {
    // Filter out recently played sounds to avoid repetition
    const availableSounds = soundFiles.filter(sound => !recentlyPlayedSounds.includes(sound));
    
    // If we've played all sounds or nearly all, reset the recently played list
    if (availableSounds.length <= 2) {
        recentlyPlayedSounds = [];
    }
    
    // Select a random sound from available sounds
    const randomIndex = Math.floor(Math.random() * availableSounds.length);
    const soundFile = availableSounds[randomIndex];
    
    // Add to recently played list and maintain its max size
    recentlyPlayedSounds.push(soundFile);
    if (recentlyPlayedSounds.length > MAX_RECENT_SOUNDS) {
        recentlyPlayedSounds.shift(); // Remove oldest sound
    }
    
    playSpecificSound(soundFile);
}


/**
 * Plays a start sound
 */
function playStartSound() {
    const randomStartIndex = Math.floor(Math.random() * startSoundFiles.length);
    const soundFile = startSoundFiles[randomStartIndex];
    const startAudio = new Audio(chrome.runtime.getURL(`mp3/${soundFile}`));
    
    // Extract character name from the sound file
    // Format is typically: start/charactername_rest_of_filename.mp3
    const filenameWithoutPath = soundFile.replace('start/', '');
    const parts = filenameWithoutPath.split('_');
    let characterName = '';
    
    if (parts.length > 0) {
        characterName = parts[0];
        console.log(`Start sound character: ${characterName}`);
    }
    
    // Update character container and image
    const characterImg = characterContainer.querySelector('.openfront-character-image');
    const audioTitle = characterContainer.querySelector('.openfront-audio-title');
    
    if (characterImg && audioTitle) {
        // Remove fade-out class if present
        characterContainer.classList.remove('fade-out');
        
        // Show container and update image
        characterContainer.style.display = 'flex';
        
        // Set character image if we have a character name
        if (characterName) {
            characterImg.src = chrome.runtime.getURL(`img/characters/${characterName}.webp`);
            characterImg.style.display = 'block';
        } else {
            characterImg.style.display = 'none';
        }
        
        // Get the text for this sound file
        // The keys in startTexts match the file paths in startSoundFiles
        const startText = startTexts[soundFile] || filenameWithoutPath.replace('.mp3', '');
        audioTitle.innerHTML = `<span class="typing-text">${startText}</span>`;
        
        // Set typing animation duration to match audio duration
        startAudio.addEventListener('loadedmetadata', () => {
            const typingElement = audioTitle.querySelector('.typing-text');
            if (typingElement) {
                const audioDuration = startAudio.duration;
                const typingDuration = audioDuration * 0.9; // 90% of audio duration
                typingElement.style.animation = `typing ${typingDuration}s steps(${startText.length * 2}, end), blink-caret 0.75s step-end infinite`;
            }
        });
        
        // Add event listener to hide container when audio ends (with 3s delay)
        startAudio.addEventListener('ended', () => {
            // Wait 3 seconds before starting fade-out
            setTimeout(() => {
                // Add fade-out class to smoothly hide the container
                characterContainer.classList.add('fade-out');
                
                // Hide container after fade-out animation completes
                setTimeout(() => {
                    characterContainer.style.display = 'none';
                }, 500); // Match the transition duration in CSS
            }, 3000); // 3 second delay before hiding
        });
    }
    
    startAudio.play().catch(error => console.error('Error playing start sound:', error));
}

/**
 * Sets up the next random interval for sound playback
 */
function setupNextSoundInterval() {
    // Always clear any existing interval first
    if (soundIntervalId) {
        clearTimeout(soundIntervalId);
        soundIntervalId = null;
    }
    
    // Only set up a new interval if extension is enabled
    if (isExtensionEnabled) {
        // Random interval between min_interval and max_interval
        const min_interval = 60 * 1000; // 1 minute
        const max_interval = 2 * 60 * 1000; // 2 minutes
        const delay = Math.floor(Math.random() * (max_interval - min_interval + 1)) + min_interval;
        
        console.log(`Setting up next sound interval in ${Math.round(delay/1000)} seconds`);
        
        soundIntervalId = setTimeout(() => {
            playRandomSound();
            setupNextSoundInterval(); // Set up next interval
        }, delay);
    }
}

/**
 * Extracts population values from the DOM
 * @returns {Object} Object containing current and total population values
 */
function extractPopulation() {
    try {
        // Find the container with population info
        const container = document.querySelector('.bg-black\\/30.text-white');
        if (!container) return { current: '0', total: '0' };

        // Find the population value
        const popElement = Array.from(container.querySelectorAll('div')).find(
            div => div.textContent.includes('Pop:')
        );
        if (!popElement) return { current: '0', total: '0' };

        // Extract both current and total population values
        const text = popElement.querySelector('span[translate="no"]')?.textContent || '';
        const values = text.match(/(\d+\.?\d*K?)\s*\/\s*(\d+\.?\d*K?)/);
        return values ? { current: values[1], total: values[2] } : { current: '0', total: '0' };
    } catch (error) {
        console.error('Error extracting population:', error);
        return { current: '0', total: '0' };
    }
}

/**
 * Updates the population display
 */
function updateDisplay() {
    // Update display content based on extension state
    if (!isExtensionEnabled) {
        // When disabled, just show the disabled message
        display.innerHTML = `
            <div class="openfront-stats">
                OpenFront Extension: disabled (press: ALT + T)
            </div>
        `;
        display.classList.remove('hidden'); // Always show the disabled message
        return;
    }
    
    // When enabled, show the population stats
    const { current, total } = extractPopulation();
    const currentElement = display.querySelector('.value');
    const totalElement = display.querySelector('.total-value');
    
    if (currentElement && totalElement) {
        currentElement.textContent = current;
        totalElement.textContent = total;
        
        // Calculate and update percentage
        const percentElement = display.querySelector('.percent-value');
        if (percentElement) {
            const currentNum = parseFloat(current.replace('K', ''));
            const totalNum = parseFloat(total.replace('K', ''));
            const percentage = totalNum > 0 ? Math.round((currentNum / totalNum) * 100) : 0;
            percentElement.textContent = `${percentage}%`;

            // Only play sounds if extension is enabled
            if (isExtensionEnabled) {
                // Play start sound when crossing 2.5K (only once)
                if (currentNum >= 2.5 && !hasPassedStartThreshold) {
                    hasPassedStartThreshold = true;
                    console.log('Playing start sound (2.5K threshold)');
                    playStartSound();
                } else if (currentNum < 2.5) {
                    // Reset the flag if population drops below threshold
                    hasPassedStartThreshold = false;
                }

                // Play sounds when crossing 70% threshold (only once)
                if (percentage >= 70 && !hasPassedSeventyPercent) {
                    hasPassedSeventyPercent = true;
                    console.log('Playing 70% threshold sound');
                    
                    // Play 70% population sound if available
                    const seventyPercentSound = 'mrbeast_70percent_population_wow_thats_a_lot.mp3';
                    if (soundFiles.includes(seventyPercentSound)) {
                        playSpecificSound(seventyPercentSound);
                    }
                } else if (percentage < 70) {
                    // Reset the flag if percentage drops below threshold
                    hasPassedSeventyPercent = false;
                }
                
                // Play sound when crossing 60% threshold (only once)
                if (percentage >= 60 && !hasPassedSixtyPercent) {
                    hasPassedSixtyPercent = true;
                    console.log('Playing 60% threshold sound');
                    
                    // Play the 60% sound
                    const sixtyPercentSound = new Audio(chrome.runtime.getURL('mp3/sound/60%.mp3'));
                    sixtyPercentSound.play().catch(error => console.error('Error playing 60% sound:', error));
                } else if (percentage < 60) {
                    // Reset the flag if percentage drops below threshold
                    hasPassedSixtyPercent = false;
                }
            }
        }
    }

    // Show display if we're on a game page
    const shouldShow = window.location.pathname.includes('/join/');
    display.classList.toggle('hidden', !shouldShow);
}

// Create and inject display elements
const display = document.createElement('div');
display.className = 'openfront-population-display hidden';
display.innerHTML = `
    <div class="openfront-stats">
        Population: <span class="value">0</span> / <span class="total-value">0</span> (<span class="percent-value">0%</span>)
    </div>
`;
document.body.appendChild(display);

// Create and inject character container
const characterContainer = document.createElement('div');
characterContainer.className = 'openfront-character-container';
characterContainer.style.display = 'none';
characterContainer.innerHTML = `
    <img class="openfront-character-image" style="display: none;">
    <span class="openfront-audio-title"></span>
`;
document.body.appendChild(characterContainer);

// Toggle extension enabled/disabled with Alt+T
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 't') {
        isExtensionEnabled = !isExtensionEnabled;
        console.log('OpenFront Extension:', isExtensionEnabled ? 'ENABLED' : 'DISABLED');
        
        // Reset display content
        if (isExtensionEnabled) {
            display.innerHTML = `
                <div class="openfront-stats">
                    Population: <span class="value">0</span> / <span class="total-value">0</span> (<span class="percent-value">0%</span>)
                </div>
            `;
        }
        
        updateDisplay(); // Update display immediately
        
        // Reset and restart sound interval with new timing
        clearTimeout(soundIntervalId);
        setupNextSoundInterval();
    }
});

// Set up update interval
const updateInterval = setInterval(updateDisplay, 1000);

// Initial update
updateDisplay();

// Start random sound playback
setupNextSoundInterval();

// Clean up on page unload
window.addEventListener('unload', () => {
    clearInterval(updateInterval);
    display.remove();
    characterContainer.remove();
});

// Update when URL changes (for single-page app navigation)
let lastPath = window.location.pathname;
setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
        lastPath = currentPath;
        updateDisplay();
    }
}, 500);
