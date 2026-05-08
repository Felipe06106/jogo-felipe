// AudioManager.js — Procedural audio via Web Audio API
const AudioManager = {
    ctx: null,
    musicGain: null,
    sfxGain: null,
    musicVolume: 0.3,
    sfxVolume: 0.7,
    musicInterval: null,
    initialized: false,

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.ctx.destination);
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch(e) { console.warn('Web Audio not supported'); }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    playTone(freq, duration, type, dest, freqEnd) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(dest || this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playNoise(duration, dest) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        source.connect(gain);
        gain.connect(dest || this.sfxGain);
        source.start();
    },

    shootRevolver() { this.playNoise(0.05); this.playTone(200, 0.1, 'sawtooth', null, 50); },
    shootShotgun() { this.playNoise(0.08); this.playTone(100, 0.15, 'sawtooth', null, 30); },
    shootRifle() { this.playTone(400, 0.2, 'sawtooth', null, 80); },
    ricochet() { this.playTone(800, 0.15, 'sine', null, 2000); },
    coinPickup() { this.playTone(600, 0.1, 'sine', null, 1200); },
    hit() { this.playNoise(0.03); this.playTone(60, 0.05, 'square'); },
    enemyDeath() { this.playTone(200, 0.15, 'square', null, 40); },
    reload() { this.playTone(300, 0.08, 'triangle', null, 600); setTimeout(() => this.playTone(500, 0.08, 'triangle', null, 800), 100); },
    buttonClick() { this.playTone(800, 0.05, 'square', null, 1000); },
    waveStart() { this.playTone(400, 0.1, 'triangle', null, 800); setTimeout(() => this.playTone(600, 0.15, 'triangle', null, 1000), 120); },
    levelComplete() {
        [0, 150, 300, 450].forEach((d, i) => {
            setTimeout(() => this.playTone(400 + i*200, 0.2, 'sine'), d);
        });
    },
    gameOver() {
        [0, 200, 400].forEach((d, i) => {
            setTimeout(() => this.playTone(300 - i*80, 0.3, 'sawtooth'), d);
        });
    },

    startMusic() {
        if (!this.ctx || this.musicInterval) return;
        const notes = [220, 247, 294, 330, 392, 440, 392, 330, 294, 247];
        let idx = 0;
        this.musicInterval = setInterval(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = notes[idx % notes.length];
            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
            idx++;
        }, 350);
    },

    stopMusic() {
        if (this.musicInterval) { clearInterval(this.musicInterval); this.musicInterval = null; }
    },

    setMusicVolume(v) { this.musicVolume = v; if (this.musicGain) this.musicGain.gain.value = v; },
    setSfxVolume(v) { this.sfxVolume = v; if (this.sfxGain) this.sfxGain.gain.value = v; }
};
