// InputManager.js — Unified keyboard + pointer (mouse/touchpad/touch) input
const InputManager = {
    keys: {},
    keysJustPressed: {},
    mouse: { x: 0, y: 0, down: false, clicked: false },
    canvas: null,
    scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0,

    // Game-relevant key codes that should be intercepted
    _gameKeys: new Set([
        'KeyW', 'KeyA', 'KeyS', 'KeyD',
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'KeyR', 'Digit1', 'Digit2', 'Digit3',
        'Enter', 'Escape'
    ]),

    init(canvas) {
        this.canvas = canvas;

        // Keyboard — only prevent default for game keys
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            this.keysJustPressed[e.code] = true;
            if (this._gameKeys.has(e.code)) e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        // Use Pointer Events API — works with mouse, touchpad, touch, pen
        // Listen on window so touchpad gestures outside canvas still register movement
        window.addEventListener('pointermove', e => this._updatePointer(e));

        // Pointer down/up on canvas for shooting
        canvas.addEventListener('pointerdown', e => {
            e.preventDefault();
            this._updatePointer(e);
            this.mouse.down = true;
            this.mouse.clicked = true;
        });
        canvas.addEventListener('pointerup', e => {
            this.mouse.down = false;
        });
        canvas.addEventListener('pointerleave', e => {
            // Don't reset down on leave — touchpad taps might cause quick leave
        });

        // Also listen on window for pointerup in case finger/mouse releases outside canvas
        window.addEventListener('pointerup', e => {
            this.mouse.down = false;
        });

        // Fallback: regular click event for touchpad tap-to-click
        canvas.addEventListener('click', e => {
            this._updatePointer(e);
            this.mouse.clicked = true;
        });

        // Touch events fallback for mobile
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            const t = e.touches[0];
            this._updateTouch(t);
            this.mouse.down = true;
            this.mouse.clicked = true;
        }, { passive: false });
        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            this._updateTouch(e.touches[0]);
        }, { passive: false });
        canvas.addEventListener('touchend', e => {
            e.preventDefault();
            this.mouse.down = false;
        }, { passive: false });

        // Disable context menu on canvas (right-click)
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    },

    setScale(sx, sy, ox, oy) {
        this.scaleX = sx; this.scaleY = sy;
        this.offsetX = ox; this.offsetY = oy;
    },

    _updatePointer(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = (e.clientX - rect.left) / this.scaleX;
        this.mouse.y = (e.clientY - rect.top) / this.scaleY;
    },

    _updateTouch(t) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = (t.clientX - rect.left) / this.scaleX;
        this.mouse.y = (t.clientY - rect.top) / this.scaleY;
    },

    isDown(code) { return !!this.keys[code]; },

    wasClicked() {
        if (this.mouse.clicked) { this.mouse.clicked = false; return true; }
        return false;
    },

    consumeClick() { this.mouse.clicked = false; },

    endFrame() {
        this.mouse.clicked = false;
        this.keysJustPressed = {};
    }
};
