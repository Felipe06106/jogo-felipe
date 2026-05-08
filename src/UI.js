// UI.js — HUD and in-game UI rendering
const UI = {
    drawHUD(renderer, player, waveNum, totalWaves, enemiesLeft) {
        const W = renderer.W;
        const ctx = renderer.ctx;

        // Health bar
        const hpBarW = 180;
        const hpBarH = 16;
        const hpX = 16;
        const hpY = 16;
        ctx.fillStyle = '#333';
        ctx.fillRect(hpX, hpY, hpBarW, hpBarH);
        const hpRatio = player.hp / player.maxHp;
        const hpColor = hpRatio > 0.5 ? '#4CAF50' : hpRatio > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillStyle = hpColor;
        ctx.fillRect(hpX, hpY, hpBarW * hpRatio, hpBarH);
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 2;
        ctx.strokeRect(hpX, hpY, hpBarW, hpBarH);
        renderer.drawText('HP', hpX + 4, hpY + 12, '#FFF', 8);

        // Ammo
        const weapon = player.weapon;
        const ammoText = weapon.reloading
            ? 'RECARGA...'
            : weapon.ammo + '/' + weapon.magSize;
        renderer.drawText(ammoText, hpX, hpY + 36, '#FFD700', 10);
        renderer.drawText(weapon.name, hpX, hpY + 52, '#DAA520', 8);

        // Reload progress bar
        if (weapon.reloading) {
            const prog = weapon.getReloadProgress(performance.now());
            ctx.fillStyle = '#333';
            ctx.fillRect(hpX, hpY + 58, 120, 6);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(hpX, hpY + 58, 120 * prog, 6);
        }

        // Score and coins (top-right)
        renderer.drawText('$' + player.coins, W - 16, 28, '#FFD700', 12, 'right');
        renderer.drawText('SCORE: ' + player.score, W - 16, 48, '#FFF', 8, 'right');

        // Wave info (top-center)
        renderer.drawText('WAVE ' + waveNum + '/' + totalWaves, W / 2, 28, '#FFF', 10, 'center');
        if (enemiesLeft > 0) {
            renderer.drawText('Inimigos: ' + enemiesLeft, W / 2, 46, '#FF8C00', 8, 'center');
        }

        // Weapon slots (bottom-left)
        for (let i = 0; i < player.weapons.length; i++) {
            const wx = 16 + i * 90;
            const wy = renderer.H - 36;
            const active = i === player.currentWeaponIdx;
            ctx.fillStyle = active ? 'rgba(255,215,0,0.3)' : 'rgba(0,0,0,0.4)';
            ctx.fillRect(wx, wy, 80, 28);
            ctx.strokeStyle = active ? '#FFD700' : '#555';
            ctx.lineWidth = active ? 2 : 1;
            ctx.strokeRect(wx, wy, 80, 28);
            renderer.drawText((i + 1) + '. ' + player.weapons[i].name, wx + 4, wy + 18, active ? '#FFD700' : '#AAA', 7);
        }
    },

    drawWaveAnnouncement(renderer, text, alpha) {
        renderer.setAlpha(alpha);
        renderer.drawText(text, renderer.W / 2, renderer.H / 2, '#FFD700', 24, 'center', "'Rye', serif");
        renderer.resetAlpha();
    },

    drawGameOver(renderer, score, coins) {
        const W = renderer.W;
        const H = renderer.H;
        const ctx = renderer.ctx;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);

        renderer.drawText('GAME OVER', W / 2, H / 2 - 60, '#FF4444', 28, 'center', "'Rye', serif");
        renderer.drawText('Score: ' + score, W / 2, H / 2, '#FFF', 14, 'center');
        renderer.drawText('Moedas: $' + coins, W / 2, H / 2 + 30, '#FFD700', 12, 'center');
        renderer.drawText('Clique para continuar', W / 2, H / 2 + 70, '#DAA520', 10, 'center');
    },

    drawLevelComplete(renderer, levelName, score) {
        const W = renderer.W;
        const H = renderer.H;
        const ctx = renderer.ctx;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);

        renderer.drawText('FASE COMPLETA!', W / 2, H / 2 - 60, '#4CAF50', 24, 'center', "'Rye', serif");
        renderer.drawText(levelName, W / 2, H / 2 - 20, '#FFD700', 14, 'center', "'Rye', serif");
        renderer.drawText('Score: ' + score, W / 2, H / 2 + 20, '#FFF', 12, 'center');
        renderer.drawText('Clique para continuar', W / 2, H / 2 + 60, '#DAA520', 10, 'center');
    }
};
