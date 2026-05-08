// LevelManager.js — Level definitions, wave spawning, obstacles
const LevelManager = {
    levels: [
        {
            name: 'Deserto Seco',
            mapW: 1440, mapH: 1080,
            bgColor: '#C4A24D',
            waves: [
                { enemies: [{ type: 'bandit', count: 3 }] },
                { enemies: [{ type: 'bandit', count: 4 }, { type: 'mounted', count: 1 }] },
                { enemies: [{ type: 'bandit', count: 3 }, { type: 'mounted', count: 2 }] }
            ],
            obstacles: [
                { type: 'cactus', positions: [[200, 200], [600, 400], [1000, 300], [300, 800], [900, 700]] },
                { type: 'rock', positions: [[400, 600], [800, 200], [1200, 500], [150, 500], [700, 900]] }
            ]
        },
        {
            name: 'Cidade Fantasma',
            mapW: 1440, mapH: 1080,
            bgColor: '#8B7355',
            waves: [
                { enemies: [{ type: 'bandit', count: 4 }, { type: 'sniper', count: 1 }] },
                { enemies: [{ type: 'mounted', count: 3 }, { type: 'sniper', count: 2 }] },
                { enemies: [{ type: 'bandit', count: 3 }, { type: 'mounted', count: 2 }, { type: 'sniper', count: 2 }] },
                { enemies: [{ type: 'mounted', count: 4 }, { type: 'sniper', count: 3 }] }
            ],
            obstacles: [
                { type: 'building_saloon', positions: [[300, 150]] },
                { type: 'building_general', positions: [[700, 150]] },
                { type: 'rock', positions: [[500, 500], [900, 600], [200, 700]] },
                { type: 'cactus', positions: [[1100, 400], [100, 300]] }
            ]
        },
        {
            name: 'Cânion do Diabo',
            mapW: 1440, mapH: 1080,
            bgColor: '#A0522D',
            waves: [
                { enemies: [{ type: 'mounted', count: 4 }, { type: 'sniper', count: 2 }] },
                { enemies: [{ type: 'bandit', count: 5 }, { type: 'mounted', count: 3 }] },
                { enemies: [{ type: 'mounted', count: 4 }, { type: 'sniper', count: 3 }] },
                { enemies: [{ type: 'bandit', count: 4 }, { type: 'mounted', count: 4 }, { type: 'sniper', count: 3 }] },
                { enemies: [{ type: 'mounted', count: 6 }, { type: 'sniper', count: 4 }] }
            ],
            obstacles: [
                { type: 'rock', positions: [[200, 300], [600, 200], [1000, 400], [400, 700], [800, 800], [1200, 300]] },
                { type: 'cactus', positions: [[350, 500], [750, 600], [1100, 700]] }
            ]
        }
    ],

    currentLevel: 0,

    getLevel(idx) {
        return this.levels[Math.min(idx, this.levels.length - 1)];
    },

    getLevelCount() {
        return this.levels.length;
    },

    createObstacles(levelDef) {
        const obstacles = [];
        for (const group of levelDef.obstacles) {
            const typeName = group.type;
            for (const [ox, oy] of group.positions) {
                let sprite, w, h;
                if (typeName === 'cactus') {
                    sprite = SpriteFactory.cactus();
                    w = 32; h = 40;
                } else if (typeName === 'rock') {
                    sprite = SpriteFactory.rock();
                    w = 32; h = 24;
                } else if (typeName.startsWith('building_')) {
                    const bType = typeName.replace('building_', '');
                    sprite = SpriteFactory.building(bType);
                    w = 64; h = 48;
                } else {
                    continue;
                }
                obstacles.push({ x: ox, y: oy, w, h, sprite, type: typeName });
            }
        }
        return obstacles;
    },

    spawnWave(waveDef, levelDef) {
        const enemies = [];
        for (const group of waveDef.enemies) {
            for (let i = 0; i < group.count; i++) {
                let x, y;
                // Spawn at edges
                const side = Math.floor(Math.random() * 4);
                if (side === 0) { x = Math.random() * levelDef.mapW; y = -30; }
                else if (side === 1) { x = Math.random() * levelDef.mapW; y = levelDef.mapH + 30; }
                else if (side === 2) { x = -30; y = Math.random() * levelDef.mapH; }
                else { x = levelDef.mapW + 30; y = Math.random() * levelDef.mapH; }

                // Snipers spawn in building areas or random spots
                if (group.type === 'sniper') {
                    x = 100 + Math.random() * (levelDef.mapW - 200);
                    y = 50 + Math.random() * 150;
                }

                enemies.push(new Enemy(group.type, x, y, LevelManager.currentLevel + 1));
            }
        }
        return enemies;
    }
};
