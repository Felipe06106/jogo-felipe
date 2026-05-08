// Player.js — Player character on horseback
class Player {
    constructor(x, y, saveData) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 56;
        this.speed = 200;
        this.hp = 100;
        this.maxHp = 100;
        this.alive = true;
        this.angle = 0;
        this.invincible = 0; // invincibility timer after hit
        this.coins = saveData.coins || 0;
        this.score = 0;

        // Palette from equipped skin
        this.palette = this._getPalette(saveData.equippedHorseSkin || 'mustang');
        this.sprite = SpriteFactory.playerHorse(this.palette);

        // Weapons
        this.weapons = [];
        const purchased = saveData.purchasedWeapons || ['revolver'];
        purchased.forEach(w => {
            if (WeaponTypes[w]) this.weapons.push(new Weapon(w));
        });
        this.currentWeaponIdx = 0;
        this.weapon = this.weapons[0];

        // Dust trail timer
        this.dustTimer = 0;
    }

    _getPalette(skin) {
        const palettes = {
            mustang: { horse: '#8B4513', mane: '#2F1B0E', saddle: '#A0522D', shirt: '#C4A24D', hat: '#3D2B1F' },
            pinto: { horse: '#F5DEB3', mane: '#8B4513', saddle: '#654321', shirt: '#B22222', hat: '#2F2F2F' },
            black: { horse: '#1a1a1a', mane: '#000', saddle: '#333', shirt: '#C0C0C0', hat: '#111' },
            white: { horse: '#F0F0F0', mane: '#CCC', saddle: '#8B7355', shirt: '#DAA520', hat: '#654321' }
        };
        return palettes[skin] || palettes.mustang;
    }

    update(dt, mapW, mapH) {
        if (!this.alive) return;

        const now = performance.now();
        this.weapon.updateReload(now);

        // Invincibility countdown
        if (this.invincible > 0) this.invincible -= dt;

        // Movement
        let dx = 0, dy = 0;
        if (InputManager.isDown('KeyW') || InputManager.isDown('ArrowUp')) dy = -1;
        if (InputManager.isDown('KeyS') || InputManager.isDown('ArrowDown')) dy = 1;
        if (InputManager.isDown('KeyA') || InputManager.isDown('ArrowLeft')) dx = -1;
        if (InputManager.isDown('KeyD') || InputManager.isDown('ArrowRight')) dx = 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len; dy /= len;
            this.x += dx * this.speed * dt;
            this.y += dy * this.speed * dt;

            // Dust particles
            this.dustTimer -= dt;
            if (this.dustTimer <= 0) {
                ParticleSystem.dust(this.x, this.y + this.height / 2);
                this.dustTimer = 0.15;
            }
        }

        // Clamp to map
        this.x = Math.max(this.width / 2, Math.min(mapW - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(mapH - this.height / 2, this.y));

        // Aim toward mouse (world coords)
        const mx = InputManager.mouse.x + Renderer.camera.x;
        const my = InputManager.mouse.y + Renderer.camera.y;
        this.angle = Math.atan2(my - this.y, mx - this.x);

        // Shoot
        if (InputManager.mouse.down) {
            const bullets = this.weapon.fire(this.x, this.y, this.angle, now);
            if (bullets.length > 0) return bullets;
        }

        // Reload with R
        if (InputManager.isDown('KeyR')) {
            this.weapon.startReload(now);
        }

        // Weapon switch with 1-3
        if (InputManager.isDown('Digit1') && this.weapons.length >= 1) this.switchWeapon(0);
        if (InputManager.isDown('Digit2') && this.weapons.length >= 2) this.switchWeapon(1);
        if (InputManager.isDown('Digit3') && this.weapons.length >= 3) this.switchWeapon(2);

        return [];
    }

    switchWeapon(idx) {
        if (idx !== this.currentWeaponIdx && idx < this.weapons.length) {
            this.currentWeaponIdx = idx;
            this.weapon = this.weapons[idx];
        }
    }

    takeDamage(amount) {
        if (this.invincible > 0) return;
        this.hp -= amount;
        this.invincible = 0.5;
        AudioManager.hit();
        ParticleSystem.blood(this.x, this.y);
        if (this.hp <= 0) {
            this.hp = 0;
            this.alive = false;
        }
    }

    collectCoin(value) {
        this.coins += value;
        this.score += value * 10;
        AudioManager.coinPickup();
    }

    render(renderer) {
        if (!this.alive) return;
        // Blink when invincible
        if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) return;
        renderer.drawSprite(this.sprite, this.x, this.y, 0);
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
