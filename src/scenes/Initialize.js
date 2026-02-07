class Initialize extends Phaser.Scene {
    constructor() {
        super('initializeScene');
    }

    preload() {
        this.load.image('block', './assets/block.png');
        this.load.image('controller-circle', './assets/controller-circle.png');
        this.load.image('controller-line', './assets/controller-line.png');

        tetrominoNames.forEach(tetrominoName => {
            this.load.image(tetrominoName, `./assets/${tetrominoName}.png`);
        });

        this.load.json('tetromino_collision', './assets/collision/tetromino.json');
    }

    create() {
        this.scene.start('physicsBoxScene');
    }
}
