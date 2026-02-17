class Initialize extends Phaser.Scene {
    constructor() {
        super('initializeScene');
    }

    preload() {
        this.load.image('controller-circle', './assets/ui/controller-circle.png');

        tetrominoNames.forEach(tetrominoName => {
            this.load.image(tetrominoName, `./assets/objects/${tetrominoName}.png`);
        });

        this.load.image('thruster', './assets/objects/thruster.png');

        this.load.spritesheet('asteroid_small', './assets/objects/asteroid_small.png', { frameWidth: 64 });
        this.load.spritesheet('asteroid_medium', './assets/objects/asteroid_medium.png', { frameWidth: 256 });

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

        this.scene.start('orbitScene');
    }
}
