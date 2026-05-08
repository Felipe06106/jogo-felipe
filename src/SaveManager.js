// SaveManager.js — Persistence via localStorage
const SaveManager = {
    KEY: 'wildwest_save',

    defaultData() {
        return {
            coins: 0,
            highScores: [0, 0, 0],
            unlockedWeaponSkins: ['default'],
            unlockedHorseSkins: ['mustang'],
            equippedWeaponSkin: 'default',
            equippedHorseSkin: 'mustang',
            purchasedWeapons: ['revolver'],
            levelsCompleted: [false, false, false],
            settings: { musicVolume: 0.3, sfxVolume: 0.7 }
        };
    },

    load() {
        try {
            const raw = localStorage.getItem(this.KEY);
            if (raw) {
                const data = JSON.parse(raw);
                const def = this.defaultData();
                // Merge with defaults for forward compat
                for (const k in def) { if (!(k in data)) data[k] = def[k]; }
                return data;
            }
        } catch(e) { console.warn('Save load error', e); }
        return this.defaultData();
    },

    save(data) {
        try { localStorage.setItem(this.KEY, JSON.stringify(data)); }
        catch(e) { console.warn('Save error', e); }
    },

    reset() {
        localStorage.removeItem(this.KEY);
    }
};
