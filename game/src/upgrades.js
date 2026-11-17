export const UPGRADE_POOL = [
  { id: 'damage', title: '+25% Damage', desc: 'Increases lantern beam damage.' },
  { id: 'firerate', title: '+20% Fire Rate', desc: 'Shorter delay between shots.' },
  { id: 'speed', title: '+15% Move Speed', desc: 'Move faster across the arena.' },
  { id: 'hp', title: '+1 Max HP & Heal', desc: 'Increases max health and restores 1 HP.' },
  { id: 'spread', title: 'Spread Shot', desc: 'Fire an extra projectile per shot.' },
  { id: 'piercing', title: 'Piercing Shots', desc: 'Projectiles pass through enemies.' },
  { id: 'dash', title: 'Agile Dash', desc: 'Dash cooldown reduced by 40%.' },
  { id: 'magnet', title: 'Ember Magnet', desc: 'Ember pickup radius doubled.' },
  { id: 'nova', title: 'Nova Surplus', desc: '+1 max Nova charge and gain +1 now.' },
  { id: 'bulletspeed', title: 'Beam Velocity', desc: 'Projectiles travel 25% faster.' }
];

export function getRandomUpgrades(rand, count = 3) {
  const pool = [...UPGRADE_POOL];
  const chosen = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rand.next() * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  return chosen;
}

export function applyUpgrade(player, upgradeId) {
  if (upgradeId === 'damage') {
    player.bulletDamage = Math.round((player.bulletDamage * 1.25) * 10) / 10;
  } else if (upgradeId === 'firerate') {
    player.fireRate = Math.round((player.fireRate * 1.2) * 10) / 10;
  } else if (upgradeId === 'speed') {
    player.speed = Math.round(player.speed * 1.15);
  } else if (upgradeId === 'hp') {
    player.maxHp += 1;
    player.hp = Math.min(player.maxHp, player.hp + 1);
  } else if (upgradeId === 'spread') {
    player.spread = Math.min(5, player.spread + 1);
  } else if (upgradeId === 'piercing') {
    player.piercing = true;
  } else if (upgradeId === 'dash') {
    player.dashCooldown = Math.max(0.4, player.dashCooldown * 0.6);
  } else if (upgradeId === 'magnet') {
    player.magnetRadius *= 2;
  } else if (upgradeId === 'nova') {
    player.maxNova += 1;
    player.novaCharges = Math.min(player.maxNova, player.novaCharges + 1);
  } else if (upgradeId === 'bulletspeed') {
    player.bulletSpeed *= 1.25;
  }
}
