// Game.js — Main game logic, update loop, collision detection
const Game = {
    player: null,
    bullets: [],
    enemies: [],
    obstacles: [],
    coins: [],
    tumbleweeds: [],
    levelDef: null,
    saveData: null,
    currentWave: 0,
    waveAnnounceTimer: 0,
    waveAnnounceText: '',
    waveDelay: 0,
    mapW: 1440,
    mapH: 1080,
    running: false,

    init() {
        this.saveData = SaveManager.load();
    },

    startLevel(levelIdx) {
        LevelManager.currentLevel = levelIdx;
        this.levelDef = LevelManager.getLevel(levelIdx);
        this.mapW = this.levelDef.mapW;
        this.mapH = this.levelDef.mapH;
        this.player = new Player(this.mapW / 2, this.mapH / 2, this.saveData);
        this.bullets = [];
        this.enemies = [];
        this.coins = [];
        this.tumbleweeds = [];
        this.obstacles = LevelManager.createObstacles(this.levelDef);
        this.currentWave = 0;
        this.waveDelay = 0;
        this.running = true;

        // Spawn tumbleweeds
        for (let i = 0; i < 3; i++) {
            this.tumbleweeds.push({
                x: Math.random() * this.mapW,
                y: Math.random() * this.mapH,
                vx: 20 + Math.random() * 30,
                vy: (Math.random() - 0.5) * 10,
                angle: 0,
                sprite: SpriteFactory.tumbleweed()
            });
        }

        this.announceWave();
        AudioManager.init();
        AudioManager.resume();
        AudioManager.startMusic();
        AudioManager.waveStart();

        SceneManager.change('playing');
    },

    announceWave() {
        this.currentWave++;
        if (this.currentWave > this.levelDef.waves.length) return;
        this.waveAnnounceText = 'WAVE ' + this.currentWave;
        this.waveAnnounceTimer = 2;
        this.waveDelay = 2;
    },

    spawnCurrentWave() {
        const waveDef = this.levelDef.waves[this.currentWave - 1];
        if (!waveDef) return;
        const newEnemies = LevelManager.spawnWave(waveDef, this.levelDef);
        this.enemies.push(...newEnemies);
    },

    update(dt) {
        if (!this.running || !SceneManager.is('playing')) return;

        // Wave delay
        if (this.waveDelay > 0) {
            this.waveDelay -= dt;
            if (this.waveDelay <= 0) {
                this.spawnCurrentWave();
            }
        }

        // Wave announcement
        if (this.waveAnnounceTimer > 0) {
            this.waveAnnounceTimer -= dt;
        }

        // Update player
        const newBullets = this.player.update(dt, this.mapW, this.mapH);
        if (newBullets && newBullets.length > 0) {
            this.bullets.push(...newBullets);
        }

        // Update enemies
        for (const enemy of this.enemies) {
            const eBullets = enemy.update(dt, this.player.x, this.player.y);
            if (eBullets.length > 0) this.bullets.push(...eBullets);
        }

        // Update bullets
        for (const bullet of this.bullets) {
            bullet.update(dt);
        }

        // Update particles
        ParticleSystem.update(dt);

        // Update tumbleweeds
        for (const tw of this.tumbleweeds) {
            tw.x += tw.vx * dt;
            tw.y += tw.vy * dt;
            tw.angle += dt * 3;
            if (tw.x > this.mapW + 40) { tw.x = -40; tw.y = Math.random() * this.mapH; }
            if (tw.x < -40) { tw.x = this.mapW + 40; }
        }

        // Collision: player bullets vs enemies
        for (const bullet of this.bullets) {
            if (!bullet.alive || bullet.owner !== 'player') continue;
            for (const enemy of this.enemies) {
                if (!enemy.alive) continue;
                if (this._circleRect(bullet.x, bullet.y, bullet.radius, enemy.getBounds())) {
                    enemy.takeDamage(bullet.damage);
                    bullet.hitTarget();
                    this.player.score += 10;
                    if (!enemy.alive) {
                        this.player.score += enemy.scoreValue;
                        // Drop coin
                        for (let c = 0; c < enemy.coinValue; c++) {
                            this.coins.push({
                                x: enemy.x + (Math.random() - 0.5) * 20,
                                y: enemy.y + (Math.random() - 0.5) * 20,
                                value: 1,
                                sprite: SpriteFactory.coin(),
                                life: 10
                            });
                        }
                        ParticleSystem.coinBurst(enemy.x, enemy.y);
                    }
                    break;
                }
            }
        }

        // Collision: enemy bullets vs player
        for (const bullet of this.bullets) {
            if (!bullet.alive || bullet.owner !== 'enemy') continue;
            if (this._circleRect(bullet.x, bullet.y, bullet.radius, this.player.getBounds())) {
                this.player.takeDamage(bullet.damage);
                bullet.hitTarget();
            }
        }

        // Collision: bullets vs obstacles
        for (const bullet of this.bullets) {
            if (!bullet.alive) continue;
            for (const obs of this.obstacles) {
                if (this._circleRect(bullet.x, bullet.y, bullet.radius,
                    { x: obs.x - obs.w / 2, y: obs.y - obs.h / 2, w: obs.w, h: obs.h })) {
                    bullet.hitObstacle();
                    break;
                }
            }
        }

        // Coin pickup
        const pBounds = this.player.getBounds();
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            coin.life -= dt;
            if (coin.life <= 0) { this.coins.splice(i, 1); continue; }
            if (this._rectRect(pBounds, { x: coin.x - 7, y: coin.y - 7, w: 14, h: 14 })) {
                this.player.collectCoin(coin.value);
                ParticleSystem.coinBurst(coin.x, coin.y);
                this.coins.splice(i, 1);
            }
        }

        // Remove dead bullets
        this.bullets = this.bullets.filter(b => b.alive);

        // Remove dead enemies
        this.enemies = this.enemies.filter(e => e.alive);

        // Check wave completion
        if (this.enemies.length === 0 && this.waveDelay <= 0) {
            if (this.currentWave < this.levelDef.waves.length) {
                this.announceWave();
            } else if (this.currentWave >= this.levelDef.waves.length) {
                // Level complete!
                this.running = false;
                this.saveData.coins = this.player.coins;
                this.saveData.levelsCompleted[LevelManager.currentLevel] = true;
                const hs = this.saveData.highScores[LevelManager.currentLevel] || 0;
                if (this.player.score > hs) this.saveData.highScores[LevelManager.currentLevel] = this.player.score;
                SaveManager.save(this.saveData);
                AudioManager.levelComplete();
                AudioManager.stopMusic();
                SceneManager.change('levelComplete');
            }
        }

        // Player death
        if (!this.player.alive) {
            this.running = false;
            this.saveData.coins = this.player.coins;
            SaveManager.save(this.saveData);
            AudioManager.gameOver();
            AudioManager.stopMusic();
            SceneManager.change('gameOver');
        }

        // Camera follow
        Renderer.camera.x = Math.max(0, Math.min(this.mapW - Renderer.W, this.player.x - Renderer.W / 2));
        Renderer.camera.y = Math.max(0, Math.min(this.mapH - Renderer.H, this.player.y - Renderer.H / 2));
    },

    render(renderer) {
        if (SceneManager.is('playing') || SceneManager.is('gameOver') || SceneManager.is('levelComplete')) {
            // Ground
            renderer.clear(this.levelDef.bgColor);

            // Ground pattern (sand dots)
            const ctx = renderer.ctx;
            const cx = renderer.camera.x;
            const cy = renderer.camera.y;
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            for (let gx = -cx % 40; gx < renderer.W; gx += 40) {
                for (let gy = -cy % 40; gy < renderer.H; gy += 40) {
                    ctx.fillRect(gx, gy, 2, 2);
                }
            }

            // Obstacles
            for (const obs of this.obstacles) {
                renderer.drawSprite(obs.sprite, obs.x, obs.y, 0);
            }

            // Tumbleweeds
            for (const tw of this.tumbleweeds) {
                renderer.drawSprite(tw.sprite, tw.x, tw.y, tw.angle);
            }

            // Coins
            for (const coin of this.coins) {
                const alpha = coin.life < 2 ? coin.life / 2 : 1;
                renderer.setAlpha(alpha);
                renderer.drawSprite(coin.sprite, coin.x, coin.y, 0);
                renderer.resetAlpha();
            }

            // Enemies
            for (const enemy of this.enemies) {
                enemy.render(renderer);
            }

            // Player
            this.player.render(renderer);

            // Bullets
            for (const bullet of this.bullets) {
                bullet.render(renderer);
            }

            // Particles
            ParticleSystem.render(renderer);

            // HUD
            UI.drawHUD(renderer, this.player, this.currentWave, this.levelDef.waves.length, this.enemies.length);

            // Wave announcement
            if (this.waveAnnounceTimer > 0) {
                const alpha = Math.min(1, this.waveAnnounceTimer);
                UI.drawWaveAnnouncement(renderer, this.waveAnnounceText, alpha);
            }

            // Overlays
            if (SceneManager.is('gameOver')) {
                UI.drawGameOver(renderer, this.player.score, this.player.coins);
            }
            if (SceneManager.is('levelComplete')) {
                UI.drawLevelComplete(renderer, this.levelDef.name, this.player.score);
            }
        }
    },

    _circleRect(cx, cy, cr, rect) {
        const nearX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
        const nearY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
        const dx = cx - nearX;
        const dy = cy - nearY;
        return (dx * dx + dy * dy) < (cr * cr);
    },

    _rectRect(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }
};
