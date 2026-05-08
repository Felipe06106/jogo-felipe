// SceneManager.js — Manages game scenes/states
const SceneManager = {
    currentScene: 'menu', // menu, playing, shop, gameOver, levelComplete, paused
    previousScene: null,

    change(scene) {
        this.previousScene = this.currentScene;
        this.currentScene = scene;
    },

    is(scene) {
        return this.currentScene === scene;
    },

    back() {
        if (this.previousScene) {
            this.currentScene = this.previousScene;
            this.previousScene = null;
        }
    }
};
