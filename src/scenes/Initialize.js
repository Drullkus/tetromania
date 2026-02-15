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

        this.load.image('thruster', './assets/blocks/thruster.png')

        this.load.json('tetromino_collision', './assets/collision/tetromino.json');

        this.load.json('technology_collision', './assets/collision/technology.json');
    }

    create() {
        const collisions = {
            ...this.cache.json.get('tetromino_collision'),
            ...this.cache.json.get('technology_collision')
        };

        const partCentroids = {};

        partNames.forEach(tetrominoName => {
            // Unknown when and where centerOfMass is set within lifecycle of this.matter.add.sprite
            const tetromino = this.matter.add.sprite(0, 0, tetrominoName, 0, {
                shape: collisions[tetrominoName]
            });

            partCentroids[tetrominoName] = new Phaser.Math.Vector2(tetromino.body.centerOffset);

            tetromino.destroy();
        });

        window.partCentroids = partCentroids;

        this.scene.start('clickDevScene');
    }
}
