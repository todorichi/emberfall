export function createBulletManager() {
  const playerBullets = [];
  const enemyBullets = [];

  return {
    playerBullets,
    enemyBullets,
    addPlayerBullet(x, y, vx, vy, damage = 1, piercing = false) {
      playerBullets.push({ x, y, vx, vy, damage, piercing, dist: 0, maxDist: 500 });
    },
    addEnemyBullet(x, y, vx, vy, damage = 1) {
      enemyBullets.push({ x, y, vx, vy, damage, radius: 6 });
    },
    update(dt, width, height) {
      for (let i = playerBullets.length - 1; i >= 0; i--) {
        const b = playerBullets[i];
        const stepDist = Math.hypot(b.vx * dt, b.vy * dt);
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.dist += stepDist;
        if (b.dist > b.maxDist || b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
          playerBullets.splice(i, 1);
        }
      }
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < -50 || b.x > width + 50 || b.y < -50 || b.y > height + 50) {
          enemyBullets.splice(i, 1);
        }
      }
    },
    clear() {
      playerBullets.length = 0;
      enemyBullets.length = 0;
    }
  };
}
