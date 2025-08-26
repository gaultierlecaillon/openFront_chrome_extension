// Radio configuration and state
let radioConfig = null;
let radioStates = {}; // Track playing state for each radio
let display = null; // Global reference to the display element

/**
 * Load radio configuration from JSON file and generate missing properties
 */
async function loadRadioConfig() {
    try {
        const response = await fetch(chrome.runtime.getURL('radio-config.json'));
        radioConfig = await response.json();
        
        // Auto-generate missing properties for each radio
        radioConfig.radios.forEach((radio, index) => {
            // Generate ID from name (lowercase, replace spaces with dashes)
            radio.id = radio.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            
            // Generate container class
            radio.containerClass = `openfront-${radio.id}-container`;
            
            // Generate title from name
            radio.title = radio.name;
            
            // Generate texts
            radio.texts = {
                playing: `Turn off ${radio.name} 🤫`,
                stopped: radio.name
            };
            
            // Initialize state
            radioStates[radio.id] = false;
        });
        
        console.log('Radio configuration loaded and processed:', radioConfig);
    } catch (error) {
        console.error('Error loading radio configuration:', error);
    }
}

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
        // Find the container with troop info using the working method
        const container = document.querySelector('.block.bg-black\\/30.text-white');
        if (!container) {
            //console.log('Could not find troops container');
            return { current: '0', total: '0' };
        }
        
        //console.log('Found container using .block.bg-black\\/30.text-white');
        
        // Find the element containing troop values using the working method
        let troopText = '';
        
        // Find a span with translate="no" attribute that contains a slash
        const translateSpans = container.querySelectorAll('span[translate="no"]');
        for (const span of translateSpans) {
            if (span.textContent && span.textContent.includes('/')) {
                troopText = span.textContent;
                //console.log('Found troop text using span[translate="no"] with / character');
                break;
            }
        }
        
        if (!troopText) {
            //console.log('Could not find troop values text');
            return { current: '0', total: '0' };
        }
        
        // Extract the values using regex
        const values = troopText.match(/(\d+\.?\d*[KM]?)\s*\/\s*(\d+\.?\d*[KM]?)/);
        if (values) {
            //console.log('Found troop values:', values[1], values[2]);
            return { current: values[1], total: values[2] };
        } else {
            //console.log('Could not parse troop values from text:', troopText);
            return { current: '0', total: '0' };
        }
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
 * Generic function to toggle radio music
 * @param {Object} radioConfig - Radio configuration object
 */
function toggleRadioMusic(radioConfig) {
    const isPlaying = radioStates[radioConfig.id];
    const iframeId = `${radioConfig.id}-iframe`;
    
    if (isPlaying) {
        // Stop the music by removing the iframe
        const existingIframe = document.getElementById(iframeId);
        if (existingIframe) {
            existingIframe.remove();
        }
        
        radioStates[radioConfig.id] = false;
        
        // Update button text
        const container = document.querySelector(`.${radioConfig.containerClass}`);
        const titleElement = container?.querySelector('.openfront-audio-title');
        if (titleElement) {
            titleElement.innerHTML = `<span class="typing-text">${radioConfig.texts.stopped}</span>`;
        }
    } else {
        // Create and add the YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.width = '0';  // Hidden but still playing audio
        iframe.height = '0';
        iframe.style.position = 'absolute';
        iframe.style.bottom = '0';
        iframe.style.right = '0';
        iframe.style.opacity = '0.01';  // Nearly invisible but still functional
        iframe.style.pointerEvents = 'none';  // Prevent interaction
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.src = radioConfig.youtubeUrl;
        iframe.title = radioConfig.title;
        iframe.frameBorder = '0';
        
        document.body.appendChild(iframe);
        
        radioStates[radioConfig.id] = true;
        
        // Update button text
        const container = document.querySelector(`.${radioConfig.containerClass}`);
        const titleElement = container?.querySelector('.openfront-audio-title');
        if (titleElement) {
            titleElement.innerHTML = `<span class="typing-text">${radioConfig.texts.playing}</span>`;
        }
        
        console.log(`${radioConfig.name} started with YouTube embed`);
    }
}

/**
 * Create radio button container
 * @param {Object} radio - Radio configuration object
 * @returns {HTMLElement} Radio container element
 */
function createRadioContainer(radio) {
    const container = document.createElement('div');
    container.className = radio.containerClass;
    container.innerHTML = `
        <img class="openfront-character-image" src="${chrome.runtime.getURL(`img/characters/${radio.character}`)}">
        <span class="openfront-audio-title"><span class="typing-text">${radio.texts.stopped}</span></span>
    `;
    
    // Add click event listener
    container.addEventListener('click', () => toggleRadioMusic(radio));
    
    return container;
}

/**
 * Initialize all radio containers
 */
function initializeRadios() {
    if (!radioConfig) return;
    
    radioConfig.radios.forEach(radio => {
        const container = createRadioContainer(radio);
        document.body.appendChild(container);
    });
}

/**
 * Ensure all radio containers are present in the DOM
 */
function ensureRadioContainers() {
    if (!radioConfig) return;
    
    radioConfig.radios.forEach(radio => {
        const existingContainer = document.querySelector(`.${radio.containerClass}`);
        if (!existingContainer) {
            console.log(`${radio.name} button was not found, adding it again`);
            const container = createRadioContainer(radio);
            document.body.appendChild(container);
        }
    });
}

/**
 * Clean up all radio iframes
 */
function cleanupRadioIframes() {
    if (!radioConfig) return;
    
    radioConfig.radios.forEach(radio => {
        const iframe = document.getElementById(`${radio.id}-iframe`);
        if (iframe) {
            iframe.remove();
        }
    });
}

/**
 * Remove all radio containers
 */
function removeRadioContainers() {
    if (!radioConfig) return;
    
    radioConfig.radios.forEach(radio => {
        const container = document.querySelector(`.${radio.containerClass}`);
        if (container) {
            container.remove();
        }
    });
}

// Initialize the extension
async function initialize() {
    // Load radio configuration first
    await loadRadioConfig();
    
    // Create and inject display elements
    display = document.createElement('div');
    display.className = 'openfront-population-display';
    display.innerHTML = `
        <div class="openfront-stats">
            Troupes: <span class="value">0</span> / <span class="total-value">0</span> (<span class="percent-value">0%</span>)
        </div>
    `;
    document.body.appendChild(display);
    
    // Initialize radio containers
    initializeRadios();
    
    // Ensure the buttons are added to the page after a short delay
    setTimeout(() => {
        ensureRadioContainers();
    }, 2000);
    
    // Set up update interval
    const updateInterval = setInterval(updateDisplay, 1000);
    
    // Initial update
    updateDisplay();
    
    // Clean up on page unload
    window.addEventListener('unload', () => {
        clearInterval(updateInterval);
        display.remove();
        removeRadioContainers();
        cleanupRadioIframes();
    });
    
    // Update when URL changes (for single-page app navigation)
    let lastPath = window.location.pathname;
    setInterval(() => {
        const currentPath = window.location.pathname;
        if (currentPath !== lastPath) {
            lastPath = currentPath;
            updateDisplay();
            
            // Ensure buttons are still in the DOM after page navigation
            ensureRadioContainers();
        }
    }, 500);
}

// Start the extension
initialize();
