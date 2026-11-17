export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_UPGRADE = 'upgrade';
export const SCREEN_OVER = 'over';
export const SCREEN_VICTORY = 'victory';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  return {
    draw(state, screen, best) {
      canvas.width = 960;
      canvas.height = 600;
      ctx.fillStyle = '#0d0f1e';
      ctx.fillRect(0, 0, 960, 600);

      // Grid background
      ctx.strokeStyle = '#161b36';
      ctx.lineWidth = 1;
      for (let x = 0; x < 960; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 600);
        ctx.stroke();
      }
      for (let y = 0; y < 600; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(960, y);
        ctx.stroke();
      }

      // Draw pickups
      if (state.pickups) {
        for (const p of state.pickups) {
          ctx.save();
          ctx.fillStyle = p.type === 'heart' ? '#ff3366' : '#ffaa00';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw enemies
      if (state.enemies) {
        for (const e of state.enemies) {
          ctx.save();
          ctx.fillStyle = e.color;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Draw player bullets
      if (state.playerBullets) {
        for (const b of state.playerBullets) {
          ctx.save();
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw enemy bullets
      if (state.enemyBullets) {
        for (const b of state.enemyBullets) {
          ctx.save();
          ctx.fillStyle = '#ff3366';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius || 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Draw player
      if (state.player) {
        ctx.save();
        ctx.translate(state.player.x, state.player.y);
        ctx.rotate(state.player.facing);
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(0, 0, state.player.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, -3, state.player.radius + 6, 6);
        ctx.restore();
      }

      // Draw particles
      if (state.particles) {
        state.particles.draw(ctx);
      }

      // HUD
      if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED || screen === SCREEN_UPGRADE) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px system-ui, sans-serif';
        // HP
        ctx.fillText(`HP: ${state.player ? state.player.hp : 0}/${state.player ? state.player.maxHp : 5}`, 24, 32);
        // Wave
        ctx.textAlign = 'center';
        ctx.fillText(`WAVE ${state.wave || 1} / 10`, 480, 32);
        // Score
        ctx.textAlign = 'right';
        ctx.fillText(`SCORE: ${state.score || 0}`, 936, 32);

        // Embers & Nova
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(`Embers: ${state.player ? state.player.embers : 0}/25`, 24, 576);
        ctx.fillStyle = '#ff6600';
        ctx.fillText(`Nova: ${state.player ? state.player.novaCharges : 0}/${state.player ? state.player.maxNova : 3}`, 180, 576);

        ctx.restore();
      }

      // Screens overlays
      if (screen === SCREEN_TITLE) {
        ctx.save();
        ctx.fillStyle = 'rgba(13, 15, 30, 0.85)';
        ctx.fillRect(0, 0, 960, 600);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 56px system-ui, sans-serif';
        ctx.fillText('EMBERFALL', 480, 200);

        ctx.fillStyle = '#ffaa00';
        ctx.font = '22px system-ui, sans-serif';
        ctx.fillText('Defend the Last Lantern against the Ash Wraiths', 480, 250);

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px system-ui, sans-serif';
        ctx.fillText('WASD: Move | Mouse: Aim & Shoot | Space: Dash | Q: Nova Bomb', 480, 360);
        ctx.fillText('Press Space or Click to Start', 480, 430);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(`Best Score: ${best}`, 480, 500);
        ctx.restore();
      } else if (screen === SCREEN_PAUSED) {
        ctx.save();
        ctx.fillStyle = 'rgba(13, 15, 30, 0.8)';
        ctx.fillRect(0, 0, 960, 600);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px system-ui, sans-serif';
        ctx.fillText('PAUSED', 480, 280);
        ctx.font = '18px system-ui, sans-serif';
        ctx.fillText('Press P or Esc to Resume', 480, 340);
        ctx.restore();
      } else if (screen === SCREEN_UPGRADE) {
        ctx.save();
        ctx.fillStyle = 'rgba(13, 15, 30, 0.9)';
        ctx.fillRect(0, 0, 960, 600);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 36px system-ui, sans-serif';
        ctx.fillText('CHOOSE AN UPGRADE', 480, 120);

        if (state.upgrades && state.upgrades.length > 0) {
          const w = 260, h = 220, gap = 30;
          const startX = 480 - (3 * w + 2 * gap) / 2;
          for (let i = 0; i < state.upgrades.length; i++) {
            const u = state.upgrades[i];
            const bx = startX + i * (w + gap);
            const by = 200;
            ctx.fillStyle = '#161b36';
            ctx.fillRect(bx, by, w, h);
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, w, h);

            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 18px system-ui, sans-serif';
            ctx.fillText(u.title, bx + w/2, by + 50);

            ctx.fillStyle = '#ffffff';
            ctx.font = '14px system-ui, sans-serif';
            ctx.fillText(u.desc, bx + w/2, by + 100);

            ctx.fillStyle = '#ffaa00';
            ctx.font = '12px system-ui, sans-serif';
            ctx.fillText(`Press [${i+1}] to Select`, bx + w/2, by + 170);
          }
        }
        ctx.restore();
      } else if (screen === SCREEN_OVER) {
        ctx.save();
        ctx.fillStyle = 'rgba(13, 15, 30, 0.9)';
        ctx.fillRect(0, 0, 960, 600);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff3366';
        ctx.font = 'bold 48px system-ui, sans-serif';
        ctx.fillText('DEFEAT', 480, 220);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px system-ui, sans-serif';
        ctx.fillText(`Wave Reached: ${state.wave || 1} / 10`, 480, 290);
        ctx.fillText(`Final Score: ${state.score || 0}`, 480, 330);
        ctx.fillText(`Best Score: ${best}`, 480, 370);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('Press Enter or Click to Try Again', 480, 460);
        ctx.restore();
      } else if (screen === SCREEN_VICTORY) {
        ctx.save();
        ctx.fillStyle = 'rgba(13, 15, 30, 0.92)';
        ctx.fillRect(0, 0, 960, 600);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 48px system-ui, sans-serif';
        ctx.fillText('VICTORY!', 480, 180);
        ctx.fillStyle = '#ffffff';
        ctx.font = '22px system-ui, sans-serif';
        ctx.fillText('You defended the Ember Spire and survived all 10 waves!', 480, 240);
        ctx.font = '18px system-ui, sans-serif';
        ctx.fillText(`Final Score: ${state.score || 0}`, 480, 310);
        ctx.fillText(`Best Score: ${best}`, 480, 350);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('Press Enter or Click to Play Again', 480, 450);
        ctx.restore();
      }
    }
  };
}
