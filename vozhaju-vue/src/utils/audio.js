import { useGameStore } from '../stores/gameStore';

let audioCtx = null;
let bgmInterval = null;
let isBgmPlaying = false;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

class AudioControllerClass {
    playSelect() {
        const store = useGameStore();
        if (!store.soundEnabled) return;
        initAudio();
        
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(t);
        osc.stop(t + 0.1);
    }

    playFound() {
        const store = useGameStore();
        if (!store.soundEnabled) return;
        initAudio();
        
        const t = audioCtx.currentTime;
        
        const playNote = (freq, time, dur) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(time);
            osc.stop(time + dur);
        };

        playNote(523.25, t, 0.3); // C5
        playNote(659.25, t + 0.1, 0.4); // E5
        playNote(783.99, t + 0.2, 0.6); // G5
    }

    playWin() {
        const store = useGameStore();
        if (!store.soundEnabled) return;
        initAudio();
        
        const t = audioCtx.currentTime;
        const playNote = (freq, time, dur) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.3, time + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(time);
            osc.stop(time + dur);
        };

        playNote(523.25, t, 0.2);
        playNote(523.25, t + 0.2, 0.2);
        playNote(523.25, t + 0.4, 0.2);
        playNote(659.25, t + 0.6, 0.6);
    }

    playError() {
        const store = useGameStore();
        if (!store.soundEnabled) return;
        initAudio();
        
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(t);
        osc.stop(t + 0.2);
    }

    startBarbatBGM() {
        const store = useGameStore();
        if (!store.soundEnabled) return;
        if (isBgmPlaying) return;
        initAudio();
        
        isBgmPlaying = true;
        // Persian scale 
        const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; 
        
        const playAncientNote = () => {
            if (!isBgmPlaying || !store.soundEnabled) {
                this.stopBarbatBGM();
                return;
            }

            const freq = scale[Math.floor(Math.random() * scale.length)];
            const dur = 2.0; 
            const t = audioCtx.currentTime;
            
            // Ancient Harp (Chang) / Santur
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc1.type = 'sine';
            osc1.frequency.value = freq;
            
            osc2.type = 'triangle'; 
            osc2.frequency.value = freq * 2; // Octave overtone for metallic ring
            
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.04, t + 0.02); // Pluck/Hammer strike
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur); // Ringing decay
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc1.start(t);
            osc2.start(t);
            osc1.stop(t + dur);
            osc2.stop(t + dur);
            
            bgmInterval = setTimeout(playAncientNote, (0.5 + Math.random() * 1.5) * 1000);
        };
        
        playAncientNote();
    }

    stopBarbatBGM() {
        isBgmPlaying = false;
        if (bgmInterval) {
            clearTimeout(bgmInterval);
            bgmInterval = null;
        }
    }
}

export const AudioController = new AudioControllerClass();
