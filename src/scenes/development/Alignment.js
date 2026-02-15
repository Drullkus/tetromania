class Alignment extends Phaser.Scene {
    constructor() {
        super('alignmentDevScene');
    }

    create() {
        const tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.matter.add.mouseSpring(); // Allow mouse to pick up and drag objects

        this.playerShip = new ShipContainer(this, gameWidth * 0.5, gameHeight * 0.5), technologyCollisions['thruster'];
        this.playerShip.onShip = true;

        const thrusterCentroid = partCentroids['thruster'];

        this.tetrominoes = tetrominoNames.map((tetrominoName, index) => {
            return this.matter.add.sprite(140 * (index % 4) + 75, 140 * Math.floor(index / 4) + 75, tetrominoName, 0, {
                shape: tetrominoCollisions[tetrominoName]
            });
        });

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        this.matter.world.disableGravity();

        // FIXME Why does moving this out of the lambda into a class function reference, cause `this` to change to the World object inside the closure?
        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            if (!(bodyA.gameObject && bodyB.gameObject)) {
                // world bounds has no gameObject
                return;
            }

            if (bodyA.gameObject.onShip) {
                this.collideWithShip(event, bodyA.gameObject, bodyB.gameObject);
            } else if (bodyB.gameObject.onShip) {
                this.collideWithShip(event, bodyB.gameObject, bodyA.gameObject);
            }
        });

        shapeNames.forEach((name, index) => {
            const emitter = this.add.particles(0, 0, `tetromino-${name}`, {
                lifespan: 50,
                speed: 0,
                scale: 0.125,
                color: [ 0xFF_FF_FF, 0 ],
                emitting: false,
            });
            emitter.setDepth(100 + index);

            const fieldName = `emitter${name.toUpperCase()}`;
            this[fieldName] = emitter;
            this.playerShip[fieldName] = emitter;
        });
    }

    collideWithShip(_event, shipContainer, tetromino) {
        if (angleAcceptable(tetromino.body)) {
            shipContainer.integratePart(tetromino);
        }
    }

    update(_time, deltaMillis) {
        this.playerShip.update(deltaMillis);
    }
}
