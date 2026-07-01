import confetti from 'canvas-confetti';

export function playConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f59e0b', '#d97706', '#b45309']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#f59e0b', '#d97706', '#b45309']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}
