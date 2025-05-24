// Create an audio context for generating sound
let audioContext = null;

/**
 * Creates a beep sound with the specified frequency and duration
 * @param {number} frequency - The frequency of the sound in Hz
 * @param {number} duration - The duration of the sound in ms
 */
function createBeepSound(frequency = 800, duration = 500) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency; // frequency in hertz
    
    gainNode.gain.value = 0.1; // volume
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration/1000);
    
    setTimeout(() => {
        oscillator.stop();
    }, duration);
}

/**
 * Creates a sound for the 50% population threshold
 */
function createFiftyPercentSound() {
    createBeepSound(800, 500); // Single beep at 800Hz
}

/**
 * Creates a sound for the 70% population threshold
 */
function createSeventyPercentSound() {
    // Create a double beep at a higher frequency
    createBeepSound(1000, 200);
    setTimeout(() => createBeepSound(1000, 200), 250);
}

// Make functions available globally
window.createFiftyPercentSound = createFiftyPercentSound;
window.createSeventyPercentSound = createSeventyPercentSound;
