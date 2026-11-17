import { CONFIG, WIDTH, HEIGHT } from './config.js';
import { createPlayer } from './player.js';
import { createEnemyManager } from './enemies.js';
import { createBulletManager } from './bullets.js';
import { createPickupManager } from './pickups.js';
import { createParticleSystem } from './particles.js';
import { createWaveDirector } from './waves.js';
import { getRandomUpgrades, applyUpgrade } from './upgrades.js';

export function createWorld(rand) {
  const player = createPlayer(WIDTH / 2, HEIGHT / 2, CONFIG.player);
  const enemyMgr = createEnemyManager();
  const bulletMgr = createBulletManager();
  const pickupMgr = createPickupManager();
  const particles = createParticleSystem();
  const waveDirector = createWaveDirector();

  const state = {
    player,
    enemies: enemyMgr.enemies,
    playerBullets: bulletMgr.playerBullets,
    enemyBullets: bulletMgr.enemyBullets,
    pickups: pickupMgr.pickups,
    particles,
    wave: 1,
    score: 0,
    upgrades: []
  };

  let spawnQueue = [];

  function spawnWave(waveNum) {
    state.wave = waveNum;
    const waveData = waveDirector.getWaveData(waveNum);
    spawnQueue = [...waveData.enemies];
    if (waveData.isBoss) {
      enemyMgr.spawn(WIDTH / 2, 100, 'boss', waveNum);
    }
  }

  return {
    state,
    reset() {
      player.reset(WIDTH / 2, HEIGHT / 2);
      enemyMgr.clear();
      bulletMgr.clear();
      pickupMgr.clear();
      state.score = 0;
      spawnWave(1);
    },
    spawnWave,
    step(dt, input, audio, isTitle = false) {
      if (isTitle) {
        particles.update(dt);
        return 0;
      }

      // Handle spawning non-boss waves progressively
      if (spawnQueue.length > 0 && enemyMgr.enemies.length < 12 && Math.random() < 0.1) {
        const type = spawnQueue.shift();
        const side = Math.floor(rand.next() * 4);
        let sx, sy;
        if (side === 0) { sx = rand.range(0, WIDTH); sy = -20; }
        else if (side === 1) { sx = WIDTH + 20; sy = rand.range(0, HEIGHT); }
        else if (side === 2) { sx = rand.range(0, WIDTH); sy = HEIGHT + 20; }
        else { sx = -20; sy = rand.range(0, HEIGHT); }
        enemyMgr.spawn(sx, sy, type, state.wave);
      }

      player.update(dt, input, WIDTH, HEIGHT, audio, particles, bulletMgr);
      enemyMgr.update(dt, player.x, player.y, WIDTH, HEIGHT, bulletMgr, particles);
      bulletMgr.update(dt, WIDTH, HEIGHT);
      pickupMgr.update(dt, player.x, player.y, player.magnetRadius);
      particles.update(dt);

      // Collisions: player bullets vs enemies
      for (let i = bulletMgr.playerBullets.length - 1; i >= 0; i--) {
        const b = bulletMgr.playerBullets[i];
        for (let j = enemyMgr.enemies.length - 1; j >= 0; j--) {
          const e = enemyMgr.enemies[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) < e.radius + 4) {
            e.hp -= b.damage;
            audio.playHit();
            particles.add(b.x, b.y, (rand.next()-0.5)*50, (rand.next()-0.5)*50, '#00f0ff', 4, 0.2);
            if (!b.piercing) {
              bulletMgr.playerBullets.splice(i, 1);
            }
            if (e.hp <= 0) {
              state.score += e.scoreVal;
              audio.playExplosion();
              particles.shake(0.2, 8);
              for (let p = 0; p < 3; p++) {
                pickupMgr.spawn(e.x + (rand.next()-0.5)*20, e.y + (rand.next()-0.5)*20, 'ember');
              }
              if (e.type === 'splitter') {
                enemyMgr.spawn(e.x - 10, e.y, 'drifter', state.wave);
                enemyMgr.spawn(e.x + 10, e.y, 'drifter', state.wave);
              }
              enemyMgr.enemies.splice(j, 1);
            }
            break;
          }
        }
      }

      // Collisions: pickups vs player
      for (let i = pickupMgr.pickups.length - 1; i >= 0; i--) {
        const p = pickupMgr.pickups[i];
        if (Math.hypot(player.x - p.x, player.y - p.y) < player.radius + p.radius) {
          pickupMgr.pickups.splice(i, 1);
          audio.playPickup(player.embers);
          player.embers += 1;
          if (player.embers >= 25) {
            player.embers -= 25;
            player.novaCharges = Math.min(player.maxNova, player.novaCharges + 1);
          }
        }
      }

      // Collisions: enemies / enemy bullets vs player
      if (player.invulnTimer <= 0 && !player.isDashing) {
        for (const e of enemyMgr.enemies) {
          if (Math.hypot(player.x - e.x, player.y - e.y) < player.radius + e.radius) {
            player.hp -= 1;
            player.invulnTimer = player.invulnOnHit;
            audio.playHit();
            particles.shake(0.3, 12);
            break;
          }
        }
        for (let i = bulletMgr.enemyBullets.length - 1; i >= 0; i--) {
          const b = bulletMgr.enemyBullets[i];
          if (Math.hypot(player.x - b.x, player.y - b.y) < player.radius + (b.radius || 6)) {
            player.hp -= b.damage;
            player.invulnTimer = player.invulnOnHit;
            bulletMgr.enemyBullets.splice(i, 1);
            audio.playHit();
            particles.shake(0.3, 12);
            break;
          }
        }
      }

      // Check wave clear
      if (spawnQueue.length === 0 && enemyMgr.enemies.length === 0) {
        return 'wave_clear';
      }

      if (player.hp <= 0) {
        return 'game_over';
      }

      return 0;
    }
  };
}
