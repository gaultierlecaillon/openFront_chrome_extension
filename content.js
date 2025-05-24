// State tracking
let hasPassedFiftyPercent = false;
let hasPassedSeventyPercent = false;
let hasPassedStartThreshold = false;

// Start sound files
const startSoundFiles = [
    'start/Alright, good luck out there, champ.mp3',
    'start/Good luck looser.mp3',
    'start/Haha, look Patrick, a grown-ass man .mp3',
    'start/Hope your cities fall with dignity.mp3',
    'start/I want to play a game...Live or die.mp3'
];

// Regular sound files
const soundFiles = [
    'mrbeast_70% population wow, that\'s a lot !!.mp3',
    'macronStarting tomorrow, an exceptional 69.mp3',
    'snoop_Bro, your are about to be smoked.mp3',
    'freeman_In the end, it\'s not the number of t.mp3',
    'trump_I didn\'t just beat them.mp3',
    'trump_Listen, kid—build, expand, dominate.mp3',
    'biden_one time, I get a... A small.mp3',
    'mrbeast_This guy has more pop than I have su.mp3',
    'tate_While you\'re building cities, I\'m bu.mp3',
    'tate_I left your base intact.mp3',
    'tate_I took your capital so fast, I didn\'.mp3',
    'tyger_Come on, son! Don\'t save troops like.mp3',
    'You don\'t understand… this map isn\'t.mp3'
];

// Function to play a random sound
function playRandomSound() {
    const randomIndex = Math.floor(Math.random() * soundFiles.length);
    const soundFile = soundFiles[randomIndex];
    const audio = new Audio(chrome.runtime.getURL(`mp3/${soundFile}`));
    
    // Extract character name and title
    const parts = soundFile.split('_');
    let characterName = '';
    let title = soundFile;
    
    if (parts.length > 1) {
        characterName = parts[0];
        title = parts.slice(1).join('_');
    }
    
    // Update display with character image if available
    const characterImg = display.querySelector('.openfront-character-image');
    if (characterImg) {
        characterImg.src = chrome.runtime.getURL(`img/characters/${characterName}.webp`);
        characterImg.style.display = characterName ? 'block' : 'none';
    }
    
    // Update audio title
    const audioTitle = display.querySelector('.openfront-audio-title');
    if (audioTitle) {
        audioTitle.textContent = title.replace('.mp3', '');
    }
    
    audio.play().catch(error => console.error('Error playing sound:', error));
}

// Function to set up next random interval (4-6 minutes)
function setupNextSoundInterval() {
    const minDelay = 2 * 60 * 1000; // 2 minutes
    const maxDelay = 5 * 60 * 1000; // 5 minutes
    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    setTimeout(() => {
        playRandomSound();
        setupNextSoundInterval(); // Set up next interval
    }, randomDelay);
}

// Create and inject the display element
const display = document.createElement('div');
display.className = 'openfront-population-display hidden';
display.innerHTML = `
    <img class="openfront-character-image" style="display: none;">
    <div>
        Population: <span class="value">0</span> / <span class="total-value">0</span> (<span class="percent-value">0%</span>)
        <span class="openfront-audio-title"></span>
    </div>
`;
document.body.appendChild(display);

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
                
                // Clear previous character image and title for start sounds
                const characterImg = display.querySelector('.openfront-character-image');
                const audioTitle = display.querySelector('.openfront-audio-title');
                if (characterImg) characterImg.style.display = 'none';
                if (audioTitle) audioTitle.textContent = soundFile.replace('start/', '').replace('.mp3', '');
                
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

    // Show display if we're on a game page
    const isGamePage = window.location.pathname.includes('/join/');
    display.classList.toggle('hidden', !isGamePage);
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
