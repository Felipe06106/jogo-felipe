// Shop.js — In-game shop for weapons, skins, upgrades
const Shop = {
    items: [
        { id: 'shotgun', type: 'weapon', name: 'Escopeta', description: '5 projéteis, curto alcance', price: 50, icon: '🔫' },
        { id: 'rifle', type: 'weapon', name: 'Rifle', description: 'Alta precisão, perfurante', price: 100, icon: '🎯' },
        { id: 'pinto', type: 'horseSkin', name: 'Cavalo Pinto', description: 'Cavalo branco com manchas', price: 75, icon: '🐴' },
        { id: 'black', type: 'horseSkin', name: 'Cavalo Negro', description: 'Cavalo preto misterioso', price: 120, icon: '🐎' },
        { id: 'white', type: 'horseSkin', name: 'Cavalo Branco', description: 'Cavalo branco reluzente', price: 150, icon: '🦄' },
        { id: 'heal', type: 'consumable', name: 'Tônico Vital', description: 'Recupera vida completa', price: 30, icon: '❤️' }
    ],

    selectedIdx: 0,
    scrollOffset: 0,

    canPurchase(item, saveData) {
        if (saveData.coins < item.price) return false;
        if (item.type === 'weapon' && saveData.purchasedWeapons.includes(item.id)) return false;
        if (item.type === 'horseSkin' && saveData.unlockedHorseSkins.includes(item.id)) return false;
        return true;
    },

    isOwned(item, saveData) {
        if (item.type === 'weapon') return saveData.purchasedWeapons.includes(item.id);
        if (item.type === 'horseSkin') return saveData.unlockedHorseSkins.includes(item.id);
        return false;
    },

    purchase(item, saveData) {
        if (!this.canPurchase(item, saveData)) return false;
        saveData.coins -= item.price;
        if (item.type === 'weapon') {
            saveData.purchasedWeapons.push(item.id);
        } else if (item.type === 'horseSkin') {
            saveData.unlockedHorseSkins.push(item.id);
            saveData.equippedHorseSkin = item.id;
        }
        // consumable: heal is handled by Game
        SaveManager.save(saveData);
        return true;
    },

    render(renderer, saveData) {
        const W = renderer.W;
        const H = renderer.H;
        const ctx = renderer.ctx;

        // Background
        ctx.fillStyle = 'rgba(10,5,0,0.95)';
        ctx.fillRect(0, 0, W, H);

        // Title
        renderer.drawText('LOJA', W / 2, 50, '#FFD700', 24, 'center', "'Rye', serif");
        renderer.drawText('$' + saveData.coins, W / 2, 75, '#DAA520', 12, 'center');

        // Items
        const startY = 100;
        const itemH = 60;

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const y = startY + i * itemH;
            const selected = i === this.selectedIdx;
            const owned = this.isOwned(item, saveData);
            const canBuy = this.canPurchase(item, saveData);

            // Background
            ctx.fillStyle = selected ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.03)';
            ctx.fillRect(60, y, W - 120, itemH - 4);
            ctx.strokeStyle = selected ? '#FFD700' : '#555';
            ctx.lineWidth = selected ? 2 : 1;
            ctx.strokeRect(60, y, W - 120, itemH - 4);

            // Icon & Name
            renderer.drawText(item.icon + ' ' + item.name, 80, y + 22, '#FFF', 10);
            renderer.drawText(item.description, 80, y + 40, '#AAA', 7);

            // Price / Status
            if (owned) {
                renderer.drawText('COMPRADO', W - 100, y + 28, '#4CAF50', 8, 'right');
            } else if (item.type === 'consumable') {
                renderer.drawText('$' + item.price, W - 100, y + 28, canBuy ? '#FFD700' : '#F44336', 10, 'right');
            } else {
                renderer.drawText('$' + item.price, W - 100, y + 28, canBuy ? '#FFD700' : '#F44336', 10, 'right');
            }
        }

        // Instructions
        renderer.drawText('W/S = Navegar  |  ENTER = Comprar  |  ESC = Voltar', W / 2, H - 30, '#888', 7, 'center');
    },

    handleInput(saveData) {
        if (InputManager.isDown('KeyW') || InputManager.isDown('ArrowUp')) {
            this.selectedIdx = Math.max(0, this.selectedIdx - 1);
            InputManager.keys['KeyW'] = false;
            InputManager.keys['ArrowUp'] = false;
            AudioManager.buttonClick();
        }
        if (InputManager.isDown('KeyS') || InputManager.isDown('ArrowDown')) {
            this.selectedIdx = Math.min(this.items.length - 1, this.selectedIdx + 1);
            InputManager.keys['KeyS'] = false;
            InputManager.keys['ArrowDown'] = false;
            AudioManager.buttonClick();
        }
        if (InputManager.isDown('Enter')) {
            InputManager.keys['Enter'] = false;
            const item = this.items[this.selectedIdx];
            if (this.canPurchase(item, saveData)) {
                this.purchase(item, saveData);
                AudioManager.coinPickup();
                if (item.type === 'consumable') return 'heal';
                return 'purchased';
            }
        }
        if (InputManager.isDown('Escape')) {
            InputManager.keys['Escape'] = false;
            return 'close';
        }
        return null;
    }
};
