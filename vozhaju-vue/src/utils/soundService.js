// A simple Web Audio API wrapper to generate game sounds without needing external files

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Helper to play a tone
function playTone(freq, type, duration, vol) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

export const playPop = () => {
  playTone(600, 'sine', 0.1, 0.3);
};

export const playSuccess = () => {
  playTone(523.25, 'sine', 0.1, 0.3); // C5
  setTimeout(() => playTone(659.25, 'sine', 0.15, 0.3), 100); // E5
  setTimeout(() => playTone(783.99, 'sine', 0.3, 0.3), 200); // G5
};

export const playWin = () => {
  playTone(440, 'triangle', 0.15, 0.4); 
  setTimeout(() => playTone(554.37, 'triangle', 0.15, 0.4), 150); 
  setTimeout(() => playTone(659.25, 'triangle', 0.15, 0.4), 300); 
  setTimeout(() => playTone(880, 'triangle', 0.4, 0.4), 450); 
};

// Background Music Manager
let bgMusic = null;

export const initMusic = () => {
  if (!bgMusic) {
    bgMusic = new Audio('/bg-music.mp3');
    bgMusic.loop = true;
  }
};

export const playMusic = () => {
  if (bgMusic && bgMusic.paused) {
    bgMusic.play().catch(e => console.log('Audio autoplay prevented'));
  }
};

export const pauseMusic = () => {
  if (bgMusic && !bgMusic.paused) {
    bgMusic.pause();
  }
};
