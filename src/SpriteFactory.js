// SpriteFactory.js — Procedural sprite generation via Canvas
const SpriteFactory = {
    cache: {},

    createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        return { canvas: c, ctx: c.getContext('2d') };
    },

    getSprite(name, generator, w, h) {
        if (this.cache[name]) return this.cache[name];
        const { canvas, ctx } = this.createCanvas(w, h);
        generator(ctx, w, h);
        this.cache[name] = canvas;
        return canvas;
    },

    clearCache() { this.cache = {}; },

    // Draw pixel helper
    px(ctx, x, y, color, size = 1) {
        ctx.fillStyle = color;
        ctx.fillRect(x * size, y * size, size, size);
    },

    // Player on horse (top-down)
    playerHorse(palette) {
        const key = 'player_' + JSON.stringify(palette);
        return this.getSprite(key, (ctx, w, h) => {
            const s = 2; // pixel scale
            const p = this.px.bind(this);
            // Horse body
            const hc = palette.horse || '#8B4513';
            const mc = palette.mane || '#2F1B0E';
            const sc = palette.saddle || '#A0522D';
            // Body oval
            ctx.fillStyle = hc;
            ctx.beginPath();
            ctx.ellipse(w/2, h/2+4, 12, 18, 0, 0, Math.PI*2);
            ctx.fill();
            // Head
            ctx.fillStyle = hc;
            ctx.beginPath();
            ctx.ellipse(w/2, h/2-18, 6, 8, 0, 0, Math.PI*2);
            ctx.fill();
            // Mane
            ctx.fillStyle = mc;
            ctx.fillRect(w/2-2, h/2-14, 4, 10);
            // Saddle
            ctx.fillStyle = sc;
            ctx.fillRect(w/2-6, h/2, 12, 8);
            // Rider body
            ctx.fillStyle = palette.shirt || '#C4A24D';
            ctx.fillRect(w/2-4, h/2-4, 8, 10);
            // Rider hat
            ctx.fillStyle = palette.hat || '#3D2B1F';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2-8, 7, 3, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.fillRect(w/2-3, h/2-12, 6, 5);
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(w/2-2, h/2-20, 1, 1);
            ctx.fillRect(w/2+1, h/2-20, 1, 1);
        }, 48, 56);
    },

    // Enemy bandit
    enemyBandit(type, palette) {
        const key = 'enemy_' + type + '_' + JSON.stringify(palette);
        return this.getSprite(key, (ctx, w, h) => {
            if (type === 'mounted') {
                // Horse
                ctx.fillStyle = palette.horse || '#4A3728';
                ctx.beginPath();
                ctx.ellipse(w/2, h/2+4, 10, 16, 0, 0, Math.PI*2);
                ctx.fill();
                // Head
                ctx.fillStyle = palette.horse || '#4A3728';
                ctx.beginPath();
                ctx.ellipse(w/2, h/2-16, 5, 7, 0, 0, Math.PI*2);
                ctx.fill();
            }
            // Body
            ctx.fillStyle = palette.body || '#222';
            const yOff = type === 'mounted' ? -2 : 6;
            ctx.fillRect(w/2-5, h/2+yOff-6, 10, 12);
            // Hat (bandana)
            ctx.fillStyle = palette.hat || '#8B0000';
            ctx.beginPath();
            ctx.ellipse(w/2, h/2+yOff-10, 6, 3, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.fillRect(w/2-3, h/2+yOff-14, 6, 5);
            // Bandana
            ctx.fillStyle = palette.bandana || '#C00';
            ctx.fillRect(w/2-4, h/2+yOff-4, 8, 3);
            // Gun
            ctx.fillStyle = '#555';
            ctx.fillRect(w/2+5, h/2+yOff-2, 6, 2);
        }, 40, 48);
    },

    // Window sniper
    windowSniper(palette) {
        const key = 'sniper_' + JSON.stringify(palette);
        return this.getSprite(key, (ctx, w, h) => {
            // Window frame
            ctx.fillStyle = '#5C4033';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(3, 3, w-6, h-6);
            // Sniper silhouette
            ctx.fillStyle = palette.body || '#333';
            ctx.fillRect(w/2-4, h/2-4, 8, 12);
            // Hat
            ctx.fillStyle = palette.hat || '#111';
            ctx.fillRect(w/2-5, h/2-8, 10, 4);
            // Gun flash
            ctx.fillStyle = '#888';
            ctx.fillRect(w/2+4, h/2, 8, 2);
        }, 32, 32);
    },

    // Bullet
    bullet(color) {
        const key = 'bullet_' + color;
        return this.getSprite(key, (ctx, w, h) => {
            ctx.fillStyle = color || '#FFD700';
            ctx.beginPath();
            ctx.arc(w/2, h/2, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(w/2-1, h/2-1, 1, 0, Math.PI*2);
            ctx.fill();
        }, 8, 8);
    },

    // Cactus
    cactus() {
        return this.getSprite('cactus', (ctx, w, h) => {
            ctx.fillStyle = '#2D5A27';
            // Main trunk
            ctx.fillRect(w/2-4, 8, 8, h-12);
            // Left arm
            ctx.fillRect(w/2-12, 16, 8, 4);
            ctx.fillRect(w/2-12, 12, 4, 8);
            // Right arm
            ctx.fillRect(w/2+4, 22, 8, 4);
            ctx.fillRect(w/2+8, 18, 4, 8);
            // Highlights
            ctx.fillStyle = '#3A7A33';
            ctx.fillRect(w/2-2, 10, 2, h-14);
        }, 32, 40);
    },

    // Rock
    rock() {
        return this.getSprite('rock', (ctx, w, h) => {
            ctx.fillStyle = '#6B6B6B';
            ctx.beginPath();
            ctx.moveTo(4, h-4);
            ctx.lineTo(8, 6);
            ctx.lineTo(w/2, 2);
            ctx.lineTo(w-6, 8);
            ctx.lineTo(w-2, h-4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.moveTo(8, h-6);
            ctx.lineTo(12, 10);
            ctx.lineTo(w/2, 6);
            ctx.lineTo(w/2, h-6);
            ctx.closePath();
            ctx.fill();
        }, 32, 24);
    },

    // Building
    building(type) {
        const key = 'building_' + type;
        return this.getSprite(key, (ctx, w, h) => {
            // Walls
            ctx.fillStyle = type === 'saloon' ? '#8B6914' : '#6B4226';
            ctx.fillRect(0, 0, w, h);
            // Roof
            ctx.fillStyle = '#3D2B1F';
            ctx.fillRect(-4, 0, w+8, 8);
            // Door
            ctx.fillStyle = '#2F1B0E';
            ctx.fillRect(w/2-6, h-16, 12, 16);
            // Windows
            ctx.fillStyle = '#FFD700';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(6, 12, 8, 8);
            ctx.fillRect(w-14, 12, 8, 8);
            ctx.globalAlpha = 1;
            // Sign
            if (type === 'saloon') {
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(w/2-16, -4, 32, 8);
                ctx.fillStyle = '#3D2B1F';
                ctx.font = '6px monospace';
                ctx.fillText('SALOON', w/2-14, 2);
            }
        }, 64, 48);
    },

    // Coin pickup
    coin() {
        return this.getSprite('coin', (ctx, w, h) => {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(w/2, h/2, 5, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#DAA520';
            ctx.beginPath();
            ctx.arc(w/2, h/2, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 7px monospace';
            ctx.fillText('$', w/2-2, h/2+3);
        }, 14, 14);
    },

    // Tumbleweed
    tumbleweed() {
        return this.getSprite('tumbleweed', (ctx, w, h) => {
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                const a = (Math.PI * 2 / 8) * i;
                ctx.beginPath();
                ctx.moveTo(w/2, h/2);
                ctx.lineTo(w/2 + Math.cos(a)*8, h/2 + Math.sin(a)*8);
                ctx.stroke();
            }
            ctx.fillStyle = '#A0926B';
            ctx.beginPath();
            ctx.arc(w/2, h/2, 4, 0, Math.PI*2);
            ctx.fill();
        }, 20, 20);
    }
};
