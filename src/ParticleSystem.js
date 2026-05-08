// ParticleSystem.js — Visual effects
class Particle {
    constructor(x, y, vx, vy, life, size, color) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.life = life; this.maxLife = life;
        this.size = size; this.color = color;
        this.alpha = 1;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        this.alpha = Math.max(0, this.life / this.maxLife);
        this.vy += 20 * dt; // slight gravity
    }
    get dead() { return this.life <= 0; }
}

const ParticleSystem = {
    particles: [],

    clear() { this.particles = []; },

    emit(x, y, count, config) {
        for (let i = 0; i < count; i++) {
            const angle = config.angle !== undefined
                ? config.angle + (Math.random() - 0.5) * (config.spread || Math.PI)
                : Math.random() * Math.PI * 2;
            const speed = (config.speed || 50) + Math.random() * (config.speedVar || 30);
            const life = (config.life || 0.5) + Math.random() * (config.lifeVar || 0.2);
            const size = (config.size || 2) + Math.random() * (config.sizeVar || 1);
            const colors = config.colors || ['#FFF'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life, size, color
            ));
        }
    },

    dust(x, y) {
        this.emit(x, y, 3, {
            speed: 20, speedVar: 10, life: 0.4, lifeVar: 0.2,
            size: 2, sizeVar: 1, colors: ['#C4A24D', '#8B7339', '#A0926B']
        });
    },

    gunSmoke(x, y, angle) {
        this.emit(x, y, 8, {
            angle: angle, spread: 0.5,
            speed: 60, speedVar: 20, life: 0.3, lifeVar: 0.1,
            size: 2, sizeVar: 2, colors: ['#888', '#AAA', '#CCC']
        });
    },

    spark(x, y) {
        this.emit(x, y, 6, {
            speed: 80, speedVar: 40, life: 0.2, lifeVar: 0.1,
            size: 1, sizeVar: 1, colors: ['#FFD700', '#FF8C00', '#FFF']
        });
    },

    blood(x, y) {
        this.emit(x, y, 5, {
            speed: 40, speedVar: 20, life: 0.4, lifeVar: 0.1,
            size: 2, sizeVar: 1, colors: ['#8B0000', '#FF0000', '#CC0000']
        });
    },

    coinBurst(x, y) {
        this.emit(x, y, 8, {
            speed: 60, speedVar: 30, life: 0.6, lifeVar: 0.2,
            size: 2, sizeVar: 1, colors: ['#FFD700', '#FFA500', '#DAA520']
        });
    },

    explosion(x, y) {
        this.emit(x, y, 20, {
            speed: 100, speedVar: 50, life: 0.5, lifeVar: 0.3,
            size: 3, sizeVar: 2, colors: ['#FF4500', '#FF8C00', '#FFD700', '#FFF']
        });
    },

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].dead) this.particles.splice(i, 1);
        }
    },

    render(renderer) {
        for (const p of this.particles) {
            renderer.setAlpha(p.alpha);
            renderer.drawCircle(p.x, p.y, p.size, p.color);
        }
        renderer.resetAlpha();
    }
};
