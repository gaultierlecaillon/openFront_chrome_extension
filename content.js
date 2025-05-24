// State tracking
let hasPassedFiftyPercent = false;
let hasPassedSeventyPercent = false;
let hasPassedStartThreshold = false;
let isTestMode = false; // Test mode flag

// Audio file to text mapping
const audioTexts = {
    // MrBeast audio clips
    'mrbeast_70percent_population_wow_thats_a_lot.mp3': "70% population ! Wow, that's a lot...",
    'mrbeast_this_guy_has_more_pop_than_subs.mp3': "This guy has more population than I have subscribers!",
    
    // Snoop Dogg audio clips
    'snoop_bro_you_are_about_to_be_smoked.mp3': "Bro, you are about to be smoked!",
    
    // Morgan Freeman audio clips
    'freeman_in_the_end_its_not_the_number.mp3': "In the end, it's not the number of troops you have, it's how many you are willing to lose. And I’m willing to lose them all.",
    
    // Trump audio clips
    'trump_i_didnt_just_beat_them.mp3': "I didn’t just beat them. I humiliated them. Wiped them off the map like they were never even there.",
    'trump_listen_kid_build_expand_dominate.mp3': "Listen, kid—build, expand, dominate. It’s not rocket science, it’s winning.",
    'trump_your_strategy_trash.mp3': "Your strategy? Trash. Mine? Pure domination. That’s why you follow and I lead.",
    
    // Biden audio clips
    'biden_one_time_i_get_a_small.mp3': "One time, I get aaaaa...  A small [...] back there in the Minesota. one many. Have you seen the price of warship recently? Anyway, shold we crack a join now?",
    
    // Andrew Tate audio clips
    'tate_i_left_your_base_intact.mp3': "I left your base intact. Not out of mercy—out of disrespect.",
    'tate_i_took_your_capital_so_fast.mp3': "I took your capital so fast, I didn’t even notice you had one.",
    'tate_while_youre_building_cities.mp3': "While you’re building cities, I’m building empires. Try to keep up, dork.",
    
    // tyson audio clips
    'tyson_come_on_son_dont_save_troops.mp3': "Come on, son! Don’t save troops like it’s your fucking birthday—spend 'em and break their spine!",
    
    // Omni audio clips
    'omni_you_dont_understand_this_map.mp3': "You don’t understand… this map isn’t yours to conquer. I’m gonna fucke you up.",
    'spongebob_look_patrick_grown_man.mp3': "Haha, look Patrick, a grown-ass man playing video-games!"
};

// Start sound texts
const startTexts = {
    'start/alright_good_luck_out_there_champ.mp3': "Alright, good luck out there, champ!",
    'start/good_luck_looser.mp3': "Good luck, loser!",
    'start/hope_your_cities_fall_with_dignity.mp3': "Hope your cities fall with dignity!",
    'start/i_want_to_play_a_game_live_or_die.mp3': "I want to play a game... Live or die, make your choice."
};

// Toggle test mode with Alt+T
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 't') {
        isTestMode = !isTestMode;
        console.log('Test mode:', isTestMode ? 'ON' : 'OFF');
        updateDisplay(); // Update display immediately
        
        // Reset and restart sound interval with new timing
        clearTimeout(soundIntervalId);
        setupNextSoundInterval();
    }
});

// Start sound files
const startSoundFiles = [
    'start/alright_good_luck_out_there_champ.mp3',
    'start/good_luck_looser.mp3',
    'start/hope_your_cities_fall_with_dignity.mp3',
    'start/i_want_to_play_a_game_live_or_die.mp3'
];

// Regular sound files
const soundFiles = [
    'mrbeast_70percent_population_wow_thats_a_lot.mp3',
    'snoop_bro_you_are_about_to_be_smoked.mp3',
    'freeman_in_the_end_its_not_the_number.mp3',
    'trump_i_didnt_just_beat_them.mp3',
    'trump_listen_kid_build_expand_dominate.mp3',
    'biden_one_time_i_get_a_small.mp3',
    'mrbeast_this_guy_has_more_pop_than_subs.mp3',
    'tate_while_youre_building_cities.mp3',
    'tate_i_left_your_base_intact.mp3',
    'tate_i_took_your_capital_so_fast.mp3',
    'tyson_come_on_son_dont_save_troops.mp3',
    'omni_you_dont_understand_this_map.mp3',
    'spongebob_look_patrick_grown_man.mp3'
];

// Track recently played sounds to avoid repetition
let recentlyPlayedSounds = [];
const MAX_RECENT_SOUNDS = Math.min(5, Math.floor(soundFiles.length / 2)); // Keep track of up to 5 recent sounds or half the total

// Function to play a random sound with improved randomization
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

// Track sound interval ID for clearing
let soundIntervalId;

// Function to set up next random interval
function setupNextSoundInterval() {
    if (soundIntervalId) {
        clearTimeout(soundIntervalId);
    }
    
    const delay = isTestMode ? 15000 : // 15 seconds in test mode
        Math.floor(Math.random() * (5 * 60 * 1000 - 2 * 60 * 1000 + 1)) + 2 * 60 * 1000; // 2-5 minutes normally
    
    soundIntervalId = setTimeout(() => {
        playRandomSound();
        setupNextSoundInterval(); // Set up next interval
    }, delay);
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

// Function to extract population value from the DOM
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

// Function to update the display
function updateDisplay() {
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

            // Play start sound when crossing 2.5K
            if (currentNum >= 2.5 && !hasPassedStartThreshold) {
                hasPassedStartThreshold = true;
                const randomStartIndex = Math.floor(Math.random() * startSoundFiles.length);
                const soundFile = startSoundFiles[randomStartIndex];
                const startAudio = new Audio(chrome.runtime.getURL(`mp3/${soundFile}`));
                
                // Show character container for start sounds
                characterContainer.classList.remove('fade-out');
                characterContainer.style.display = 'flex';
                
                const audioTitle = characterContainer.querySelector('.openfront-audio-title');
                if (audioTitle) {
                    const startText = startTexts[soundFile] || soundFile.replace('start/', '').replace('.mp3', '');
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
                    
                    // Add event listener to hide container when audio ends (with 5s delay)
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

            // Play sounds when crossing thresholds
            if (percentage >= 70 && !hasPassedSeventyPercent) {
                hasPassedSeventyPercent = true;
                window.createSeventyPercentSound();
            } else if (percentage < 70) {
                hasPassedSeventyPercent = false;
            }

            if (percentage >= 50 && !hasPassedFiftyPercent) {
                hasPassedFiftyPercent = true;
                window.createFiftyPercentSound();
            } else if (percentage < 50) {
                hasPassedFiftyPercent = false;
            }
        }
    }

    // Show display if we're on a game page or in test mode
    const shouldShow = isTestMode || window.location.pathname.includes('/join/');
    display.classList.toggle('hidden', !shouldShow);
}

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
