// utils/confetti.ts
import confetti from 'canvas-confetti';

export function launchConfetti() {
  confetti({
    particleCount: 400,
    spread: 130,
    origin: { y: 0.6 },
    shapes: ['star'],
  });
}
