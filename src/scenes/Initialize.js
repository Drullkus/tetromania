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
        var tetrominoCollisions = this.cache.json.get('tetromino_collision');

        this.matter.add.mouseSpring(); // Allow mouse to pick up and drag objects

        tetrominoNames.forEach((tetrominoName, index) => {
            const tetromino = this.matter.add.sprite(150 * ((index + 1) % 4), 150 * Math.floor((index + 1) / 4), tetrominoName, 0, {
                shape: tetrominoCollisions[tetrominoName]
            });

            this[tetrominoName] = tetromino;
        });

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        // this.matter.world.disableGravity();

        this.tetrominoCollisions = tetrominoCollisions;
    }

    update() {

    }
}
