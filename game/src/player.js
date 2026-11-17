export function createPlayer(x, y, config) {
  return {
    x,
    y,
    radius: config.radius,
    speed: config.speed,
    hp: config.maxHp,
    maxHp: config.maxHp,
    fireRate: config.fireRate,
    bulletSpeed: config.bulletSpeed,
    bulletDamage: config.bulletDamage,
    bulletRange: config.bulletRange,
    dashSpeed: config.dashSpeed,
    dashDuration: config.dashDuration,
    dashCooldown: config.dashCooldown,
    invulnOnHit: config.invulnOnHit,
    
    // Upgraded stats flags
    spread: 1,
    piercing: false,
    magnetRadius: 90,
    maxNova: 3,
    novaCharges: 1,
    embers: 0,
    
    // Runtime state
    vx: 0,
    vy: 0,
    facing: 0,
    fireTimer: 0,
    dashTimer: 0,
    dashCooldownTimer: 0,
    invulnTimer: 0,
    isDashing: false,
    dashDirX: 0,
    dashDirY: 0,

    reset(startX, startY) {
      this.x = startX;
      this.y = startY;
      this.hp = this.maxHp;
      this.embers = 0;
      this.novaCharges = 1;
      this.fireTimer = 0;
      this.dashTimer = 0;
      this.dashCooldownTimer = 0;
      this.invulnTimer = 0;
      this.isDashing = false;
      this.spread = 1;
      this.piercing = false;
    },

    update(dt, input, width, height, audio, particles, bulletMgr) {
      if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
      if (this.invulnTimer > 0) this.invulnTimer -= dt;
      if (this.fireTimer > 0) this.fireTimer -= dt;

      const movement = input.getMovement();
      const mouse = input.getMouse();

      this.facing = Math.atan2(mouse.y - this.y, mouse.x - this.x);

      if (this.isDashing) {
        this.x += this.dashDirX * this.dashSpeed * dt;
        this.y += this.dashDirY * this.dashSpeed * dt;
        this.dashTimer -= dt;
        particles.add(this.x, this.y, (Math.random()-0.5)*20, (Math.random()-0.5)*20, '#00f0ff', 6, 0.2);
        if (this.dashTimer <= 0) {
          this.isDashing = false;
        }
      } else {
        this.vx = movement.x * this.speed;
        this.vy = movement.y * this.speed;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
      }

      // Boundaries
      this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
      this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));

      // Firing
      if (mouse.down && this.fireTimer <= 0) {
        this.fireTimer = 1 / this.fireRate;
        audio.playShoot();
        const baseAngle = this.facing;
        const spreadAngle = 0.12;
        for (let i = 0; i < this.spread; i++) {
          const offset = this.spread === 1 ? 0 : (i - (this.spread - 1) / 2) * spreadAngle;
          const angle = baseAngle + offset;
          const bvx = Math.cos(angle) * this.bulletSpeed;
          const bvy = Math.sin(angle) * this.bulletSpeed;
          bulletMgr.addPlayerBullet(this.x, this.y, bvx, bvy, this.bulletDamage, this.piercing);
          particles.add(this.x + Math.cos(angle)*15, this.y + Math.sin(angle)*15, bvx*0.2, bvy*0.2, '#00f0ff', 3, 0.1);
        }
      }
    },

    dash(audio) {
      if (this.dashCooldownTimer <= 0 && !this.isDashing) {
        const movement = inputGetMovementApprox(this);
        this.dashDirX = movement.x !== 0 || movement.y !== 0 ? movement.x : Math.cos(this.facing);
        this.dashDirY = movement.x !== 0 || movement.y !== 0 ? movement.y : Math.sin(this.facing);
        const len = Math.hypot(this.dashDirX, this.dashDirY);
        if (len > 0) {
          this.dashDirX /= len;
          this.dashDirY /= len;
        } else {
          this.dashDirX = 1;
          this.dashDirY = 0;
        }
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldownTimer = this.dashCooldown;
        this.invulnTimer = this.dashDuration + 0.1;
        audio.playDash();
      }
    }
  };
}

function inputGetMovementApprox(player) {
  // Helper if needed
  return { x: Math.cos(player.facing), y: Math.sin(player.facing) };
}
