// State tracking
let hasPassedFiftyPercent = false;
let hasPassedSeventyPercent = false;

// Available sound files
const soundFiles = [
    '70% population wow, that\'s a lot !!.mp3',
    'À partir de demain, une taxe excepti.mp3',
    'Bro, your are about to be smoked.mp3',
    'Champions don\'t sit back.mp3',
    'Come on, son! Don\'t save troops like.mp3',
    'I didn\'t just beat them.mp3',
    'In the end, it\'s not the number of t.mp3',
    'Listen, kid—build, expand, dominate.mp3',
    'one time, I get a... A small.mp3',
    'Starting tomorrow, an exceptional 69.mp3',
    'This guy has more pop than I have su.mp3',
    'While you’re building cities, I’m bu.mp3',
    'I left your base intact.mp3',
    'I took your capital so fast, I didn’.mp3',
    'You don’t understand… this map isn’t.mp3' 
];

// Function to play a random sound
function playRandomSound() {
    const randomIndex = Math.floor(Math.random() * soundFiles.length);
    const audio = new Audio(chrome.runtime.getURL(`mp3/${soundFiles[randomIndex]}`));
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
display.innerHTML = `Population: <span class="value">0</span> / <span class="total-value">0</span> (<span class="percent-value">0%</span>)`;
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
