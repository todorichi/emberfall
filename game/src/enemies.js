export function createEnemyManager() {
  const enemies = [];

  return {
    enemies,
    spawn(x, y, type, wave) {
      let hp = 1;
      let speed = 120;
      let radius = 12;
      let color = '#9944bb';
      let scoreVal = 100;

      if (type === 'spitter') {
        hp = 2 + Math.floor(wave / 3);
        speed = 80;
        radius = 14;
        color = '#ff3366';
        scoreVal = 150;
      } else if (type === 'brute') {
        hp = 5 + wave;
        speed = 60;
        radius = 22;
        color = '#885533';
        scoreVal = 300;
      } else if (type === 'splitter') {
        hp = 2;
        speed = 100;
        radius = 15;
        color = '#cc33cc';
        scoreVal = 200;
      } else if (type === 'boss') {
        hp = 60 + wave * 25;
        speed = 50;
        radius = 36;
        color = '#ff2222';
        scoreVal = 2500;
      } else {
        // drifter
        hp = 1 + Math.floor(wave / 2);
        speed = 130 + wave * 3;
        radius = 12;
        color = '#9944bb';
        scoreVal = 100;
      }

      enemies.push({
        x, y, type, hp, maxHp: hp, speed, radius, color, scoreVal,
        shootTimer: 0,
        bossPhaseTimer: 0
      });
    },

    update(dt, playerX, playerY, width, height, bulletMgr, particles) {
      for (const e of enemies) {
        const dx = playerX - e.x;
        const dy = playerY - e.y;
        const dist = Math.hypot(dx, dy);

        if (e.type === 'boss') {
          // Boss movement & radial attack
          if (dist > 180) {
            e.x += (dx / dist) * e.speed * dt;
            e.y += (dy / dist) * e.speed * dt;
          }
          e.shootTimer += dt;
          if (e.shootTimer >= 1.5) {
            e.shootTimer = 0;
            const count = 12;
            for (let i = 0; i < count; i++) {
              const angle = (i / count) * Math.PI * 2;
              bulletMgr.addEnemyBullet(e.x, e.y, Math.cos(angle) * 160, Math.sin(angle) * 160, 1);
            }
          }
        } else if (e.type === 'spitter') {
          if (dist > 220) {
            e.x += (dx / dist) * e.speed * dt;
            e.y += (dy / dist) * e.speed * dt;
          } else if (dist < 160) {
            e.x -= (dx / dist) * e.speed * dt;
            e.y -= (dy / dist) * e.speed * dt;
          }
          e.shootTimer += dt;
          if (e.shootTimer >= 2.2) {
            e.shootTimer = 0;
            if (dist > 10) {
              bulletMgr.addEnemyBullet(e.x, e.y, (dx / dist) * 220, (dy / dist) * 220, 1);
            }
          }
        } else {
          // Chase player
          if (dist > 1) {
            e.x += (dx / dist) * e.speed * dt;
            e.y += (dy / dist) * e.speed * dt;
          }
        }

        // Keep inside bounds
        e.x = Math.max(e.radius, Math.min(width - e.radius, e.x));
        e.y = Math.max(e.radius, Math.min(height - e.radius, e.y));
      }
    },

    clear() {
      enemies.length = 0;
    }
  };
}
