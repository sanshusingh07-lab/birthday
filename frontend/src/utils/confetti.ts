import confetti from 'canvas-confetti';

export function fireCelebrationConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#E85B32', '#FFBFA8', '#F7A6A0', '#FFD700', '#B388FF', '#FF80AB']
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function fireBalloonPopConfetti(xRatio: number, yRatio: number) {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: xRatio, y: yRatio },
    colors: ['#E85B32', '#FFBFA8', '#FF6B8B', '#FFD166', '#06D6A0', '#118AB2', '#9D4EDD'],
    startVelocity: 30,
    scalar: 1.1,
    ticks: 200
  });
}

export function fireFireworksSequence(durationMs: number = 4000) {
  const animationEnd = Date.now() + durationMs;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / durationMs);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.15, 0.35), y: Math.random() - 0.2 },
      colors: ['#FF6B8B', '#FFD166', '#FFE66D', '#B388FF']
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.65, 0.85), y: Math.random() - 0.2 },
      colors: ['#E85B32', '#F7A6A0', '#48CAE4', '#7209B7']
    });
  }, 350);
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

