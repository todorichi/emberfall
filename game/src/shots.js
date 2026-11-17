import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER, SCREEN_VICTORY, SCREEN_UPGRADE } from './render.js';

export function stageShot(name, world) {
  let screen = SCREEN_TITLE;
  let best = 12500;

  if (name === 'title') {
    screen = SCREEN_TITLE;
  } else if (name === 'play') {
    screen = SCREEN_PLAY;
    world.state.wave = 3;
    world.state.score = 1420;
    world.state.player.x = 480;
    world.state.player.y = 300;
    world.state.player.hp = 4;
    world.state.player.embers = 18;
    world.state.player.novaCharges = 2;
    world.state.enemies.push(
      { x: 320, y: 200, radius: 12, color: '#9944bb', hp: 1, maxHp: 1 },
      { x: 640, y: 400, radius: 14, color: '#ff3366', hp: 2, maxHp: 2 }
    );
  } else if (name === 'boss' || name === 'end') {
    if (name === 'end') {
      screen = SCREEN_OVER;
      world.state.wave = 4;
      world.state.score = 2100;
    } else {
      screen = SCREEN_PLAY;
      world.state.wave = 5;
      world.state.score = 4500;
      world.state.player.x = 480;
      world.state.player.y = 450;
      world.state.player.hp = 3;
      world.state.enemies.push(
        { x: 480, y: 200, radius: 36, color: '#ff2222', hp: 75, maxHp: 100 }
      );
      world.state.enemyBullets.push(
        { x: 400, y: 300, radius: 6 },
        { x: 560, y: 300, radius: 6 }
      );
    }
  } else if (name === 'victory') {
    screen = SCREEN_VICTORY;
    world.state.wave = 10;
    world.state.score = 15800;
  }

  return { screen, best };
}
