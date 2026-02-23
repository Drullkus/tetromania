class Initialize extends Phaser.Scene {
    constructor(queryMode) {
        super('initializeScene');
        this.queryMode = queryMode ?? 'mainMenuScene';
    }

    preload() {
        this.load.path = './assets/';

        this.load.image('controller-circle', 'ui/controller-circle.png');

        this.load.image('penrose-triangle', 'penrose_triangle_icon.png');

        tetrominoNames.forEach(tetrominoName => {
            this.load.image(tetrominoName, `objects/${tetrominoName}.png`);
        });

        this.load.image('thruster', 'objects/thruster.png');
        this.load.spritesheet('ship-seed', 'objects/ship-seed.png', { frameWidth: 64, frameHeight: 96 });

        this.load.image('cosmos', 'parallax/tetromaniac_cosmos.png');
        this.load.image('stars', 'parallax/stars.png');
        this.load.image('space_dust', 'parallax/space_dust.png');

        this.load.spritesheet('asteroid_small', 'objects/asteroid_small.png', { frameWidth: 64 });
        this.load.spritesheet('asteroid_medium', 'objects/asteroid_medium.png', { frameWidth: 256 });

        const particleAnimationConfig = { frameWidth: 16 };
        this.load.spritesheet('debris', 'objects/debris.png', particleAnimationConfig);
        this.load.spritesheet('explosion', 'objects/explosion.png', particleAnimationConfig);
        this.load.spritesheet('fire', 'objects/fire.png', particleAnimationConfig);

        this.load.json('tetromino_collision', 'collision/tetromino.json');
        this.load.json('technology_collision', 'collision/technology.json');

        this.load.font('aesymatt', 'ui/aesymatt.ttf', 'truetype'); // Obtained from https://www.1001freefonts.com/aenigma-systematic.font

        this.load.audio('fuse', 'sound/fuse.wav');
        this.load.audio('rocket', 'sound/rocket-3.wav');
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

        this.createAnimations();

        this.scene.start(this.queryMode);
    }

    createAnimations() {
        this.anims.create({
            key: 'ship-seed',
            frames: this.anims.generateFrameNumbers('ship-seed', { start: 0, end: 15 }),
            frameRate: 7,
            repeat: -1
        });

        ['debris', 'fire'].forEach(name => 
            [0, 1, 2, 3].forEach((columnIndex, _index, list) => this.anims.create({
                key: `${name}-${columnIndex}`,
                frames: this.anims.generateFrameNumbers(name, {
                    frames: [1, 0, 1, 2, 3].map(rowIndex => rowIndex * list.length + columnIndex)
                }),
                frameRate: 20
            }))
        );

        [0, 1, 2, 3].forEach((columnIndex, _index, list) => this.anims.create({
            key: `explosion-${columnIndex}`,
            frames: this.anims.generateFrameNumbers('explosion', {
                frames: [0, 1, 2, 3].map(rowIndex => rowIndex * list.length + columnIndex)
            }),
            frameRate: 20
        }))
    }
}
