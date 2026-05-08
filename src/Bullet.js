// Bullet.js — Projectile system
class Bullet {
    constructor(x, y, angle, speed, damage, owner, piercing) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.speed = speed;
        this.damage = damage;
        this.owner = owner; // 'player' or 'enemy'
        this.piercing = piercing || false;
        this.pierced = 0;
        this.alive = true;
        this.life = 2; // seconds
        this.radius = 3;
        this.angle = angle;
        this.color = owner === 'player' ? '#FFD700' : '#FF4444';
        this.sprite = SpriteFactory.bullet(this.color);
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
        // Out of bounds
        if (this.x < -50 || this.x > 1500 || this.y < -50 || this.y > 1100) {
            this.alive = false;
        }
    }

    render(renderer) {
        renderer.drawSprite(this.sprite, this.x, this.y, this.angle);
    }

    hitObstacle() {
        this.alive = false;
        ParticleSystem.spark(this.x, this.y);
        AudioManager.ricochet();
    }

    hitTarget() {
        if (this.piercing && this.pierced < 1) {
            this.pierced++;
            this.damage *= 0.6;
        } else {
            this.alive = false;
        }
    }
}
