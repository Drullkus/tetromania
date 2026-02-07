class Initialize extends Phaser.Scene {
    constructor() {
        super('initializeScene');
    }

    preload() {
        this.load.image('block', './assets/block.png');

        tetrominoNames.forEach(tetrominoName => {
            this.load.image(tetrominoName, `./assets/${tetrominoName}.png`);
        });

        this.load.json('tetromino_collision', './assets/collision/tetromino.json');
    }

    create() {
        this.scene.start('physicsTestScene');
    }
}
