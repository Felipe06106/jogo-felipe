// Weapon.js — Weapon types and mechanics
const WeaponTypes = {
    revolver: {
        name: 'Revólver', damage: 25, fireRate: 400, magSize: 6,
        reloadTime: 1500, range: 500, speed: 600, spread: 0, piercing: false,
        projectiles: 1, sound: 'shootRevolver'
    },
    shotgun: {
        name: 'Escopeta', damage: 15, fireRate: 800, magSize: 2,
        reloadTime: 2000, range: 250, speed: 400, spread: 0.26, piercing: false,
        projectiles: 5, sound: 'shootShotgun'
    },
    rifle: {
        name: 'Rifle', damage: 60, fireRate: 1000, magSize: 5,
        reloadTime: 2500, range: 800, speed: 800, spread: 0, piercing: true,
        projectiles: 1, sound: 'shootRifle'
    }
};

class Weapon {
    constructor(type) {
        const def = WeaponTypes[type];
        this.type = type;
        this.name = def.name;
        this.damage = def.damage;
        this.fireRate = def.fireRate;
        this.magSize = def.magSize;
        this.reloadTime = def.reloadTime;
        this.range = def.range;
        this.speed = def.speed;
        this.spread = def.spread;
        this.piercing = def.piercing;
        this.projectiles = def.projectiles;
        this.sound = def.sound;
        this.ammo = def.magSize;
        this.lastFired = 0;
        this.reloading = false;
        this.reloadStart = 0;
    }

    canFire(now) {
        return !this.reloading && this.ammo > 0 && (now - this.lastFired) >= this.fireRate;
    }

    fire(x, y, angle, now) {
        if (!this.canFire(now)) return [];
        this.lastFired = now;
        this.ammo--;
        AudioManager[this.sound]();

        const bullets = [];
        for (let i = 0; i < this.projectiles; i++) {
            let a = angle;
            if (this.projectiles > 1) {
                a = angle - this.spread + (this.spread * 2 / (this.projectiles - 1)) * i;
            }
            a += (Math.random() - 0.5) * 0.04; // tiny random spread
            bullets.push(new Bullet(x, y, a, this.speed, this.damage, 'player', this.piercing));
        }

        ParticleSystem.gunSmoke(x, y, angle);

        if (this.ammo <= 0) this.startReload(now);
        return bullets;
    }

    startReload(now) {
        if (this.reloading || this.ammo === this.magSize) return;
        this.reloading = true;
        this.reloadStart = now;
        AudioManager.reload();
    }

    updateReload(now) {
        if (this.reloading && (now - this.reloadStart) >= this.reloadTime) {
            this.ammo = this.magSize;
            this.reloading = false;
        }
    }

    getReloadProgress(now) {
        if (!this.reloading) return 1;
        return Math.min(1, (now - this.reloadStart) / this.reloadTime);
    }
}
