// State tracking
let isLofiPlaying = false; // Track if lofi music is playing

// Lofi hip hop girl text states
const lofiTexts = {
    'playing': "Stop, I need to focus 😶",
    'stopped': "Brings the Chill Vibes 🎶"
};

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
    // Extract population values
    const { current, total } = extractPopulation();
    
    // Don't display the population stats before the game starts (when pop is 0 or not found)
    const currentNum = parseFloat(current.replace('K', ''));
    if (currentNum === 0 || current === '0') {
        display.style.display = 'none';
        return;
    } else {
        display.style.display = 'block';
    }
    
    // Update the population stats
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
        }
    }
}

/**
 * Toggles the lofi hip hop music
 */
function toggleLofiMusic() {
    if (isLofiPlaying) {
        // Stop the music by removing the iframe
        const existingIframe = document.getElementById('lofi-iframe');
        if (existingIframe) {
            existingIframe.remove();
        }
        
        isLofiPlaying = false;
        
        // Update button text
        const lofiText = lofiContainer.querySelector('.openfront-audio-title');
        if (lofiText) {
            lofiText.innerHTML = `<span class="typing-text">${lofiTexts.stopped}</span>`;
        }
    } else {
        // Create and add the YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'lofi-iframe';
        iframe.width = '0';  // Hidden but still playing audio
        iframe.height = '0';
        iframe.style.position = 'absolute';
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.opacity = '0.01';  // Nearly invisible but still functional
        iframe.style.pointerEvents = 'none';  // Prevent interaction
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.src = 'https://www.youtube.com/embed/jfKfPfyJRdk?si=OmegLvyuJMmQg_EK&autoplay=1&mute=0';
        iframe.title = 'Lofi Hip Hop Radio';
        iframe.frameBorder = '0';
        
        document.body.appendChild(iframe);
        
        isLofiPlaying = true;
        
        // Update button text
        const lofiText = lofiContainer.querySelector('.openfront-audio-title');
        if (lofiText) {
            lofiText.innerHTML = `<span class="typing-text">${lofiTexts.playing}</span>`;
        }
        
        console.log('Lofi music started with YouTube embed');
    }
}

// Create and inject display elements
const display = document.createElement('div');
display.className = 'openfront-population-display';
display.innerHTML = `
    <div class="openfront-stats">
        Population: <span class="value">0</span> / <span class="total-value">0</span> (<span class="percent-value">0%</span>)
    </div>
`;
document.body.appendChild(display);

// Create and inject lofi button container
const lofiContainer = document.createElement('div');
lofiContainer.className = 'openfront-lofi-container';
lofiContainer.innerHTML = `
    <img class="openfront-character-image" src="${chrome.runtime.getURL('img/characters/lofigirl.webp')}">
    <span class="openfront-audio-title"><span class="typing-text">${lofiTexts.stopped}</span></span>
`;
document.body.appendChild(lofiContainer);

// Add click event listener to lofi container
lofiContainer.addEventListener('click', toggleLofiMusic);

// Ensure the lofi button is added to the page after a short delay
setTimeout(() => {
    if (!document.body.contains(lofiContainer)) {
        console.log('Lofi button was not found, adding it again');
        document.body.appendChild(lofiContainer);
    }
}, 2000);

// Set up update interval
const updateInterval = setInterval(updateDisplay, 1000);

// Initial update
updateDisplay();

// Clean up on page unload
window.addEventListener('unload', () => {
    clearInterval(updateInterval);
    display.remove();
    lofiContainer.remove();
    
    // Remove lofi iframe if it exists
    const lofiIframe = document.getElementById('lofi-iframe');
    if (lofiIframe) {
        lofiIframe.remove();
    }
});

// Update when URL changes (for single-page app navigation)
let lastPath = window.location.pathname;
setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
        lastPath = currentPath;
        updateDisplay();
        
        // Ensure lofi button is still in the DOM after page navigation
        if (!document.body.contains(lofiContainer)) {
            console.log('Lofi button was removed, re-adding it');
            document.body.appendChild(lofiContainer);
        }
    }
}, 500);
