// State tracking
let isLofiPlaying = false; // Track if lofi music is playing
let isPhonkPlaying = false; // Track if phonk music is playing
let isReggaeDubPlaying = false; // Track if reggae dub music is playing

// Lofi hip hop girl text states
const lofiTexts = {
    'playing': "Turn off Lofi Radio 🤫",
    'stopped': "Lofi Radio 🎶"
};

// Phonk radio text states
const phonkTexts = {
    'playing': "Turn off Phunk Radio 🤫",
    'stopped': "Phunk Radio 🔥"
};

// Reggae dub radio text states
const reggaeDubTexts = {
    'playing': "Turn off Reggae Radio 🤫",
    'stopped': "Reggae Radio 🌴"
};

/**
 * Converts population string to numeric value
 * @param {string} popString - Population string like "53.2K" or "1.3M"
 * @returns {number} Numeric value
 */
function parsePopulation(popString) {
    if (!popString || popString === '0') return 0;
    
    const numStr = popString.replace(/[KM]/g, '');
    const num = parseFloat(numStr);
    
    if (popString.includes('M')) {
        return num * 1000000;
    } else if (popString.includes('K')) {
        return num * 1000;
    }
    
    return num;
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
        const values = text.match(/(\d+\.?\d*[KM]?)\s*\/\s*(\d+\.?\d*[KM]?)/);
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
    const currentNum = parsePopulation(current);
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
            const currentNum = parsePopulation(current);
            const totalNum = parsePopulation(total);
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

/**
 * Toggles the phonk music
 */
function togglePhonkMusic() {
    if (isPhonkPlaying) {
        // Stop the music by removing the iframe
        const existingIframe = document.getElementById('phonk-iframe');
        if (existingIframe) {
            existingIframe.remove();
        }
        
        isPhonkPlaying = false;
        
        // Update button text
        const phonkText = phonkContainer.querySelector('.openfront-audio-title');
        if (phonkText) {
            phonkText.innerHTML = `<span class="typing-text">${phonkTexts.stopped}</span>`;
        }
    } else {
        // Create and add the YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'phonk-iframe';
        iframe.width = '0';  // Hidden but still playing audio
        iframe.height = '0';
        iframe.style.position = 'absolute';
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.opacity = '0.01';  // Nearly invisible but still functional
        iframe.style.pointerEvents = 'none';  // Prevent interaction
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.src = 'https://www.youtube.com/embed/suYOayE3e00?si=f9BYuflsdIs9uFJK&autoplay=1&mute=0';
        iframe.title = 'Phonk Radio';
        iframe.frameBorder = '0';
        
        document.body.appendChild(iframe);
        
        isPhonkPlaying = true;
        
        // Update button text
        const phonkText = phonkContainer.querySelector('.openfront-audio-title');
        if (phonkText) {
            phonkText.innerHTML = `<span class="typing-text">${phonkTexts.playing}</span>`;
        }
        
        console.log('Phonk music started with YouTube embed');
    }
}

/**
 * Toggles the reggae dub music
 */
function toggleReggaeDubMusic() {
    if (isReggaeDubPlaying) {
        // Stop the music by removing the iframe
        const existingIframe = document.getElementById('reggaedub-iframe');
        if (existingIframe) {
            existingIframe.remove();
        }
        
        isReggaeDubPlaying = false;
        
        // Update button text
        const reggaeDubText = reggaeDubContainer.querySelector('.openfront-audio-title');
        if (reggaeDubText) {
            reggaeDubText.innerHTML = `<span class="typing-text">${reggaeDubTexts.stopped}</span>`;
        }
    } else {
        // Create and add the YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.id = 'reggaedub-iframe';
        iframe.width = '0';  // Hidden but still playing audio
        iframe.height = '0';
        iframe.style.position = 'absolute';
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.opacity = '0.01';  // Nearly invisible but still functional
        iframe.style.pointerEvents = 'none';  // Prevent interaction
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.src = 'https://www.youtube.com/embed/f8loSOHbdGs?si=Kau7c_0uBCasW9CD&autoplay=1&mute=0';
        iframe.title = 'Reggae Dub Radio';
        iframe.frameBorder = '0';
        
        document.body.appendChild(iframe);
        
        isReggaeDubPlaying = true;
        
        // Update button text
        const reggaeDubText = reggaeDubContainer.querySelector('.openfront-audio-title');
        if (reggaeDubText) {
            reggaeDubText.innerHTML = `<span class="typing-text">${reggaeDubTexts.playing}</span>`;
        }
        
        console.log('Reggae Dub music started with YouTube embed');
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

// Create and inject phonk button container
const phonkContainer = document.createElement('div');
phonkContainer.className = 'openfront-phonk-container';
phonkContainer.innerHTML = `
    <img class="openfront-character-image" src="${chrome.runtime.getURL('img/characters/phonk_radio.jpg')}">
    <span class="openfront-audio-title"><span class="typing-text">${phonkTexts.stopped}</span></span>
`;
document.body.appendChild(phonkContainer);

// Add click event listener to phonk container
phonkContainer.addEventListener('click', togglePhonkMusic);

// Create and inject reggae dub button container
const reggaeDubContainer = document.createElement('div');
reggaeDubContainer.className = 'openfront-reggaedub-container';
reggaeDubContainer.innerHTML = `
    <img class="openfront-character-image" src="${chrome.runtime.getURL('img/characters/reggaeDub.png')}">
    <span class="openfront-audio-title"><span class="typing-text">${reggaeDubTexts.stopped}</span></span>
`;
document.body.appendChild(reggaeDubContainer);

// Add click event listener to reggae dub container
reggaeDubContainer.addEventListener('click', toggleReggaeDubMusic);

// Ensure the buttons are added to the page after a short delay
setTimeout(() => {
    if (!document.body.contains(lofiContainer)) {
        console.log('Lofi button was not found, adding it again');
        document.body.appendChild(lofiContainer);
    }
    if (!document.body.contains(phonkContainer)) {
        console.log('Phonk button was not found, adding it again');
        document.body.appendChild(phonkContainer);
    }
    if (!document.body.contains(reggaeDubContainer)) {
        console.log('Reggae Dub button was not found, adding it again');
        document.body.appendChild(reggaeDubContainer);
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
    phonkContainer.remove();
    reggaeDubContainer.remove();
    
    // Remove iframes if they exist
    const lofiIframe = document.getElementById('lofi-iframe');
    if (lofiIframe) {
        lofiIframe.remove();
    }
    const phonkIframe = document.getElementById('phonk-iframe');
    if (phonkIframe) {
        phonkIframe.remove();
    }
    const reggaeDubIframe = document.getElementById('reggaedub-iframe');
    if (reggaeDubIframe) {
        reggaeDubIframe.remove();
    }
});

// Update when URL changes (for single-page app navigation)
let lastPath = window.location.pathname;
setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
        lastPath = currentPath;
        updateDisplay();
        
        // Ensure buttons are still in the DOM after page navigation
        if (!document.body.contains(lofiContainer)) {
            console.log('Lofi button was removed, re-adding it');
            document.body.appendChild(lofiContainer);
        }
        if (!document.body.contains(phonkContainer)) {
            console.log('Phonk button was removed, re-adding it');
            document.body.appendChild(phonkContainer);
        }
        if (!document.body.contains(reggaeDubContainer)) {
            console.log('Reggae Dub button was removed, re-adding it');
            document.body.appendChild(reggaeDubContainer);
        }
    }
}, 500);
