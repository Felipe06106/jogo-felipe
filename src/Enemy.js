// Enemy.js — Enemy types: bandit, mounted bandit, window sniper
class Enemy {
    constructor(type, x, y, level) {
        this.type = type; // 'bandit', 'mounted', 'sniper'
        this.x = x;
        this.y = y;
        this.alive = true;
        this.level = level || 1;

        // Stats scale with level
        const mult = 1 + (level - 1) * 0.25;

        if (type === 'sniper') {
            this.hp = 30 * mult;
            this.speed = 0;
            this.damage = 15 * mult;
            this.fireRate = 2000;
            this.range = 600;
            this.width = 32;
            this.height = 32;
            this.palette = { body: '#333', hat: '#111' };
            this.sprite = SpriteFactory.windowSniper(this.palette);
        } else if (type === 'mounted') {
            this.hp = 60 * mult;
            this.speed = 130;
            this.damage = 12 * mult;
            this.fireRate = 1200;
            this.range = 350;
            this.width = 40;
            this.height = 48;
            this.palette = { horse: '#4A3728', body: '#222', hat: '#8B0000', bandana: '#C00' };
            this.sprite = SpriteFactory.enemyBandit('mounted', this.palette);
        } else {
            // bandit (foot)
            this.hp = 40 * mult;
            this.speed = 80;
            this.damage = 10 * mult;
            this.fireRate = 1500;
            this.range = 300;
            this.width = 40;
            this.height = 48;
            this.palette = { body: '#3D2B1F', hat: '#8B0000', bandana: '#C00' };
            this.sprite = SpriteFactory.enemyBandit('foot', this.palette);
        }

        this.lastFired = 0;
        this.coinValue = type === 'mounted' ? 3 : type === 'sniper' ? 2 : 1;
        this.scoreValue = type === 'mounted' ? 150 : type === 'sniper' ? 120 : 100;

        // AI
        this.aiState = 'chase'; // chase, strafe, retreat
        this.strafeDir = Math.random() > 0.5 ? 1 : -1;
        this.stateTimer = 0;
    }

    update(dt, playerX, playerY) {
        if (!this.alive) return [];

        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        this.stateTimer -= dt;

        // AI state machine
        if (this.type !== 'sniper') {
            if (this.stateTimer <= 0) {
                if (dist > this.range * 1.2) {
                    this.aiState = 'chase';
                } else if (dist < this.range * 0.5) {
                    this.aiState = 'retreat';
                } else {
                    this.aiState = 'strafe';
                }
                this.stateTimer = 1 + Math.random();
            }

            let mx = 0, my = 0;
            if (this.aiState === 'chase') {
                mx = Math.cos(angle);
                my = Math.sin(angle);
            } else if (this.aiState === 'retreat') {
                mx = -Math.cos(angle);
                my = -Math.sin(angle);
            } else if (this.aiState === 'strafe') {
                mx = Math.cos(angle + Math.PI / 2) * this.strafeDir;
                my = Math.sin(angle + Math.PI / 2) * this.strafeDir;
            }

            this.x += mx * this.speed * dt;
            this.y += my * this.speed * dt;

            // Clamp to map
            this.x = Math.max(20, Math.min(1400, this.x));
            this.y = Math.max(20, Math.min(1060, this.y));
        }

        // Shoot
        const now = performance.now();
        const bullets = [];
        if (dist < this.range && (now - this.lastFired) >= this.fireRate) {
            this.lastFired = now;
            const spread = (Math.random() - 0.5) * 0.15;
            bullets.push(new Bullet(this.x, this.y, angle + spread, 350, this.damage, 'enemy'));
        }

        return bullets;
    }

    takeDamage(amount) {
        this.hp -= amount;
        ParticleSystem.blood(this.x, this.y);
        if (this.hp <= 0) {
            this.alive = false;
            AudioManager.enemyDeath();
            ParticleSystem.explosion(this.x, this.y);
        }
    }

    render(renderer) {
        if (!this.alive) return;
        renderer.drawSprite(this.sprite, this.x, this.y, 0);

        // Health bar
        const hpRatio = this.hp / (this.type === 'mounted' ? 60 : this.type === 'sniper' ? 30 : 40);
        if (hpRatio < 1) {
            const barW = this.width;
            const barX = this.x - barW / 2;
            const barY = this.y - this.height / 2 - 8;
            renderer.drawRect(barX, barY, barW, 4, '#333');
            renderer.drawRect(barX, barY, barW * Math.max(0, hpRatio), 4, hpRatio > 0.3 ? '#FF4444' : '#FF0000');
        }
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            w: this.width,
            h: this.height
        };
    }
}
