import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld } from './world.js';
import { createInput, ACTION_CONFIRM, ACTION_PAUSE } from './input.js';
import { createRenderer, SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_UPGRADE, SCREEN_OVER, SCREEN_VICTORY } from './render.js';
import { createAudio } from './audio.js';
import { getRandomUpgrades, applyUpgrade } from './upgrades.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {}
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(msg) {
    status.textContent = msg;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing Emberfall. Wave 1.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Game over. Score ${world.state.score}. Best ${best}.`);
  }

  function victoryGame() {
    screen = SCREEN_VICTORY;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Victory! Score ${world.state.score}. Best ${best}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_VICTORY)) {
      startGame();
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }

    // Upgrade selection keys 1, 2, 3
    if (screen === SCREEN_UPGRADE) {
      if (input.isDown('Digit1') || input.isDown('Numpad1')) selectUpgrade(0);
      if (input.isDown('Digit2') || input.isDown('Numpad2')) selectUpgrade(1);
      if (input.isDown('Digit3') || input.isDown('Numpad3')) selectUpgrade(2);
    }

    // Dash (Space) or Nova (Q)
    if (screen === SCREEN_PLAY) {
      if (input.isDown('Space')) {
        world.state.player.dash(audio);
      }
      if (input.isDown('KeyQ')) {
        if (world.state.player.novaCharges > 0) {
          world.state.player.novaCharges -= 1;
          audio.playNova();
          world.state.particles.shake(0.4, 20);
          // Clear enemies or damage them
          for (let i = world.state.enemies.length - 1; i >= 0; i--) {
            const e = world.state.enemies[i];
            e.hp -= 25;
            if (e.hp <= 0) {
              world.state.score += e.scoreVal;
              world.state.enemies.splice(i, 1);
            }
          }
          world.state.enemyBullets.length = 0;
        }
      }
      if (input.isDown('KeyM')) {
        audio.toggleMute();
      }
    }
  }

  function selectUpgrade(idx) {
    if (world.state.upgrades && world.state.upgrades[idx]) {
      applyUpgrade(world.state.player, world.state.upgrades[idx].id);
      audio.playPickup(5);
      if (world.state.wave >= 10) {
        victoryGame();
      } else {
        world.spawnWave(world.state.wave + 1);
        screen = SCREEN_PLAY;
        announce(`Starting Wave ${world.state.wave}.`);
      }
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, input, audio, true);
      return;
    }
    if (screen !== SCREEN_PLAY) return;

    const res = world.step(STEP, input, audio, false);
    if (res === 'game_over') {
      endGame();
    } else if (res === 'wave_clear') {
      if (world.state.wave >= 10) {
        victoryGame();
      } else {
        screen = SCREEN_UPGRADE;
        world.state.upgrades = getRandomUpgrades(createRandom(Date.now()), 3);
        announce(`Wave ${world.state.wave} cleared. Choose an upgrade.`);
      }
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Emberfall. Press Space or Click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
