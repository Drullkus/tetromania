class Initialize extends Phaser.Scene {
    constructor() {
        super('initializeScene');
    }

    preload() {
        this.load.image('controller-circle', './assets/ui/controller-circle.png');
        this.load.image('controller-line', './assets/ui/controller-line.png');

        tetrominoNames.forEach(tetrominoName => {
            this.load.image(tetrominoName, `./assets/blocks/${tetrominoName}.png`);
        });

        this.load.json('tetromino_collision', './assets/collision/tetromino.json');
    }

    create() {
        this.scene.start('physicsBoxScene');
    }
}
