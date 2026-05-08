// Renderer.js — Canvas 2D rendering wrapper
const Renderer = {
    canvas: null,
    ctx: null,
    W: 960,
    H: 540,
    camera: { x: 0, y: 0 },

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        canvas.width = this.W;
        canvas.height = this.H;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        const container = this.canvas.parentElement;
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const ratio = this.W / this.H;
        let w, h;
        if (cw / ch > ratio) { h = ch; w = h * ratio; }
        else { w = cw; h = w / ratio; }
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        const sx = w / this.W;
        const sy = h / this.H;
        const ox = (cw - w) / 2;
        const oy = (ch - h) / 2;
        this.canvas.style.marginLeft = ox + 'px';
        this.canvas.style.marginTop = oy + 'px';
        InputManager.setScale(sx, sy, ox, oy);
    },

    clear(color) {
        this.ctx.fillStyle = color || '#2a1a0a';
        this.ctx.fillRect(0, 0, this.W, this.H);
    },

    drawSprite(sprite, x, y, angle) {
        const cx = x - this.camera.x;
        const cy = y - this.camera.y;
        if (angle) {
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.rotate(angle);
            this.ctx.drawImage(sprite, -sprite.width/2, -sprite.height/2);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(sprite, cx - sprite.width/2, cy - sprite.height/2);
        }
    },

    drawRect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x - this.camera.x, y - this.camera.y, w, h);
    },

    drawCircle(x, y, r, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x - this.camera.x, y - this.camera.y, r, 0, Math.PI*2);
        this.ctx.fill();
    },

    drawText(text, x, y, color, size, align, font) {
        this.ctx.fillStyle = color || '#FFF';
        this.ctx.font = (size || 16) + 'px ' + (font || "'Press Start 2P', monospace");
        this.ctx.textAlign = align || 'left';
        this.ctx.fillText(text, x, y);
    },

    drawTextWorld(text, x, y, color, size) {
        this.drawText(text, x - this.camera.x, y - this.camera.y, color, size);
    },

    setAlpha(a) { this.ctx.globalAlpha = a; },
    resetAlpha() { this.ctx.globalAlpha = 1; },

    fillGradient(x, y, w, h, color1, color2, vertical) {
        const grad = vertical
            ? this.ctx.createLinearGradient(x, y, x, y+h)
            : this.ctx.createLinearGradient(x, y, x+w, y);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(x, y, w, h);
    }
};
