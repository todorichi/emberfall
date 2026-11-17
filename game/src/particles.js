export function createParticleSystem() {
  const particles = [];
  const floatTexts = [];
  let screenShakeTime = 0;
  let screenShakeIntensity = 0;

  return {
    add(x, y, vx, vy, color, size, life, shape = 'circle') {
      particles.push({ x, y, vx, vy, color, size, life, maxLife: life, shape });
    },
    addText(x, y, text, color) {
      floatTexts.push({ x, y, text, color, life: 0.8, maxLife: 0.8 });
    },
    shake(duration, intensity) {
      screenShakeTime = duration;
      screenShakeIntensity = intensity;
    },
    update(dt) {
      if (screenShakeTime > 0) {
        screenShakeTime -= dt;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
      for (let i = floatTexts.length - 1; i >= 0; i--) {
        const ft = floatTexts[i];
        ft.y -= 20 * dt;
        ft.life -= dt;
        if (ft.life <= 0) {
          floatTexts.splice(i, 1);
        }
      }
    },
    getShakeOffset(rand) {
      if (screenShakeTime <= 0) return { x: 0, y: 0 };
      const mag = screenShakeIntensity * (screenShakeTime / 0.3);
      return {
        x: (rand.next() * 2 - 1) * mag,
        y: (rand.next() * 2 - 1) * mag
      };
    },
    draw(ctx) {
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        if (p.shape === 'square') {
          ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      for (const ft of floatTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    }
  };
}
