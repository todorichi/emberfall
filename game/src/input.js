export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_DASH = 4;
export const ACTION_NOVA = 8;

export function createInput(canvas) {
  const keys = new Set();
  let mouseX = canvas.width / 2;
  let mouseY = canvas.height / 2;
  let mouseDown = false;
  let rightDown = false;
  let actions = 0;

  window.addEventListener('keydown', e => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD','KeyP','KeyQ','KeyM','KeyR'].includes(e.code)) {
      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD') {
        // Prevent scrolling
      }
    }
    keys.add(e.code);
    if (e.code === 'Enter' || e.code === 'Space') actions |= ACTION_CONFIRM;
    if (e.code === 'KeyP' || e.code === 'Escape') actions |= ACTION_PAUSE;
    if (e.code === 'Space') actions |= ACTION_DASH;
    if (e.code === 'KeyQ') actions |= ACTION_NOVA;
  });

  window.addEventListener('keyup', e => {
    keys.delete(e.code);
  });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  canvas.addEventListener('mousedown', e => {
    if (e.button === 0) {
      mouseDown = true;
      actions |= ACTION_CONFIRM;
    }
    if (e.button === 2) {
      rightDown = true;
      actions |= ACTION_NOVA;
    }
  });

  canvas.addEventListener('mouseup', e => {
    if (e.button === 0) mouseDown = false;
    if (e.button === 2) rightDown = false;
  });

  canvas.addEventListener('contextmenu', e => e.preventDefault());

  return {
    getMouse() { return { x: mouseX, y: mouseY, down: mouseDown }; },
    isDown(code) { return keys.has(code); },
    getMovement() {
      let x = 0, y = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
      if (x !== 0 && y !== 0) {
        x *= 0.7071;
        y *= 0.7071;
      }
      return { x, y };
    },
    takeActions() {
      const a = actions;
      actions = 0;
      return a;
    }
  };
}
