export function createPickupManager() {
  const pickups = [];

  return {
    pickups,
    spawn(x, y, type = 'ember') {
      pickups.push({ x, y, type, radius: 10, life: 30 });
    },
    update(dt, playerX, playerY, magnetRadius) {
      for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];
        p.life -= dt;
        if (p.life <= 0) {
          pickups.splice(i, 1);
          continue;
        }
        const dist = Math.hypot(playerX - p.x, playerY - p.y);
        if (dist < magnetRadius) {
          const angle = Math.atan2(playerY - p.y, playerX - p.x);
          const speed = 400 * (1 - dist / magnetRadius) + 150;
          p.x += Math.cos(angle) * speed * dt;
          p.y += Math.sin(angle) * speed * dt;
        }
      }
    },
    clear() {
      pickups.length = 0;
    }
  };
}
