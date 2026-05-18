// main.js — Entry point: initializes everything and runs the main loop
(function () {
    'use strict';

    const canvas = document.getElementById('game-canvas');
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');

    // Simulated loading progress
    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += 5 + Math.random() * 10;
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadInterval);
            setTimeout(() => finishLoading(), 300);
        }
        loadingBar.style.width = loadProgress + '%';
    }, 100);

    function finishLoading() {
        // Initialize all systems
        InputManager.init(canvas);
        Renderer.init(canvas);
        Game.init();

        // Hide loading screen
        loadingScreen.classList.add('hidden');
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 600);

        // Show menu
        SceneManager.change('menu');

        // Start game loop
        let lastTime = performance.now();
        function loop(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms
            lastTime = now;

            update(dt);
            render();

            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    // Menu state
    let menuSelectedLevel = 0;
    let menuAction = 'play'; // 'play' or 'shop'
    let menuCooldown = 0; // prevents residual clicks from triggering menu actions

    function update(dt) {
        const scene = SceneManager.currentScene;

        if (scene === 'menu') {
            // Cooldown to prevent the click that brought us here from triggering an action
            if (menuCooldown > 0) {
                menuCooldown -= dt;
                InputManager.consumeClick();
                InputManager.endFrame();
                return;
            }
            // Level selection
            if (InputManager.isDown('ArrowLeft') || InputManager.isDown('KeyA')) {
                menuSelectedLevel = Math.max(0, menuSelectedLevel - 1);
                InputManager.keys['ArrowLeft'] = false;
                InputManager.keys['KeyA'] = false;
                AudioManager.buttonClick();
            }
            if (InputManager.isDown('ArrowRight') || InputManager.isDown('KeyD')) {
                menuSelectedLevel = Math.min(LevelManager.getLevelCount() - 1, menuSelectedLevel + 1);
                InputManager.keys['ArrowRight'] = false;
                InputManager.keys['KeyD'] = false;
                AudioManager.buttonClick();
            }
            if (InputManager.isDown('ArrowUp') || InputManager.isDown('KeyW')) {
                menuAction = menuAction === 'shop' ? 'play' : 'play';
                InputManager.keys['ArrowUp'] = false;
                InputManager.keys['KeyW'] = false;
            }
            if (InputManager.isDown('ArrowDown') || InputManager.isDown('KeyS')) {
                menuAction = 'shop';
                InputManager.keys['ArrowDown'] = false;
                InputManager.keys['KeyS'] = false;
            }

            if (InputManager.wasClicked() || InputManager.isDown('Enter')) {
                InputManager.keys['Enter'] = false;
                AudioManager.init();
                AudioManager.resume();
                AudioManager.buttonClick();
                if (menuAction === 'shop') {
                    SceneManager.change('shop');
                } else {
                    Game.startLevel(menuSelectedLevel);
                }
            }
        } else if (scene === 'playing') {
            Game.update(dt);
            // Pause
            if (InputManager.isDown('Escape')) {
                InputManager.keys['Escape'] = false;
                SceneManager.change('paused');
            }
        } else if (scene === 'paused') {
            if (InputManager.isDown('Escape') || InputManager.wasClicked()) {
                InputManager.keys['Escape'] = false;
                SceneManager.change('playing');
                Game.running = true;
            }
        } else if (scene === 'shop') {
            const result = Shop.handleInput(Game.saveData);
            if (result === 'close') {
                SceneManager.change('menu');
            }
        } else if (scene === 'gameOver') {
            if (InputManager.wasClicked()) {
                SceneManager.change('menu');
                menuCooldown = 0.3;
                InputManager.consumeClick();
            }
        } else if (scene === 'levelComplete') {
            if (InputManager.wasClicked()) {
                SceneManager.change('menu');
                menuCooldown = 0.3;
                InputManager.consumeClick();
            }
        }

        InputManager.endFrame();
    }

    function render() {
        const scene = SceneManager.currentScene;

        if (scene === 'menu') {
            renderMenu();
        } else if (scene === 'shop') {
            Shop.render(Renderer, Game.saveData);
        } else if (scene === 'paused') {
            Game.render(Renderer);
            renderPause();
        } else {
            Game.render(Renderer);
        }
    }

    function renderMenu() {
        const W = Renderer.W;
        const H = Renderer.H;
        const ctx = Renderer.ctx;

        // Background gradient
        Renderer.fillGradient(0, 0, W, H, '#1a0a00', '#8B4513', true);

        // Ground line
        ctx.fillStyle = '#C4A24D';
        ctx.fillRect(0, H - 80, W, 80);
        ctx.fillStyle = '#A0926B';
        ctx.fillRect(0, H - 80, W, 3);

        // Decorative cacti
        const cactusSprite = SpriteFactory.cactus();
        Renderer.camera.x = 0;
        Renderer.camera.y = 0;
        ctx.drawImage(cactusSprite, 80, H - 110);
        ctx.drawImage(cactusSprite, W - 110, H - 115);
        ctx.drawImage(cactusSprite, W / 2 + 200, H - 105);

        // Title
        Renderer.drawText('WILD WEST', W / 2, 120, '#FFD700', 32, 'center', "'Rye', serif");
        Renderer.drawText('SHOOTER', W / 2, 165, '#DAA520', 28, 'center', "'Rye', serif");

        // Coins
        Renderer.drawText('$' + (Game.saveData ? Game.saveData.coins : 0), W / 2, 200, '#FFD700', 10, 'center');

        // Level selection
        const levels = LevelManager.levels;
        const cardW = 180;
        const cardH = 100;
        const totalW = levels.length * cardW + (levels.length - 1) * 20;
        const startX = (W - totalW) / 2;
        const cardY = 240;

        for (let i = 0; i < levels.length; i++) {
            const x = startX + i * (cardW + 20);
            const selected = i === menuSelectedLevel && menuAction === 'play';
            const completed = Game.saveData && Game.saveData.levelsCompleted[i];

            ctx.fillStyle = selected ? 'rgba(255,215,0,0.2)' : 'rgba(0,0,0,0.4)';
            ctx.fillRect(x, cardY, cardW, cardH);
            ctx.strokeStyle = selected ? '#FFD700' : completed ? '#4CAF50' : '#555';
            ctx.lineWidth = selected ? 3 : 1;
            ctx.strokeRect(x, cardY, cardW, cardH);

            Renderer.drawText('FASE ' + (i + 1), x + cardW / 2, cardY + 30, '#FFF', 10, 'center');
            Renderer.drawText(levels[i].name, x + cardW / 2, cardY + 50, '#DAA520', 7, 'center');

            if (completed) {
                Renderer.drawText('✓', x + cardW - 16, cardY + 18, '#4CAF50', 14, 'center');
            }

            const hs = Game.saveData ? (Game.saveData.highScores[i] || 0) : 0;
            if (hs > 0) {
                Renderer.drawText('Best: ' + hs, x + cardW / 2, cardY + 72, '#888', 7, 'center');
            }

            // Waves info
            Renderer.drawText(levels[i].waves.length + ' waves', x + cardW / 2, cardY + 88, '#666', 6, 'center');
        }

        // Play button
        const btnY = cardY + cardH + 30;
        const playSelected = menuAction === 'play';
        ctx.fillStyle = playSelected ? '#FFD700' : '#555';
        ctx.fillRect(W / 2 - 80, btnY, 160, 36);
        Renderer.drawText('JOGAR', W / 2, btnY + 24, playSelected ? '#1a0a00' : '#AAA', 12, 'center');

        // Shop button
        const shopY = btnY + 50;
        const shopSelected = menuAction === 'shop';
        ctx.fillStyle = shopSelected ? '#FFD700' : '#555';
        ctx.fillRect(W / 2 - 80, shopY, 160, 36);
        Renderer.drawText('LOJA', W / 2, shopY + 24, shopSelected ? '#1a0a00' : '#AAA', 12, 'center');

        // Instructions
        Renderer.drawText('A/D = Selecionar Fase  |  W/S = Menu  |  ENTER/Clique = Confirmar', W / 2, H - 20, '#666', 6, 'center');
    }

    function renderPause() {
        const W = Renderer.W;
        const H = Renderer.H;
        const ctx = Renderer.ctx;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);

        Renderer.drawText('PAUSADO', W / 2, H / 2 - 20, '#FFD700', 24, 'center', "'Rye', serif");
        Renderer.drawText('ESC ou Clique para continuar', W / 2, H / 2 + 20, '#DAA520', 10, 'center');
    }
})();
