class Click extends Phaser.Scene {
    constructor() {
        super('clickDevScene');
    }

    create() {
        const tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.matter.add.mouseSpring(); // Allow mouse to pick up and drag objects

        this.playerShip = new SpaceShip(this, gameWidth * 0.5, gameHeight * 0.5), technologyCollisions['thruster'];
        this.playerShip.onShip = true;

        const thrusterCentroid = partCentroids['thruster'];
        const tetrominoLCentroid = partCentroids['tetromino-l'];

        this.tetrominoL = this.matter.add.sprite(gameWidth * 0.5 + tetrominoLCentroid.x - thrusterCentroid.x - 32, gameHeight * 0.5 + tetrominoLCentroid.y - thrusterCentroid.y + 32, 'tetromino-l', 0, {
            shape: tetrominoCollisions['tetromino-l']
        });
        // this.playerShip.integratePart(this.tetrominoL);

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        this.matter.world.disableGravity();

        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            if (!(bodyA.gameObject && bodyB.gameObject)) {
                // world bounds has no gameObject
                return;
            }

            if (bodyA.gameObject.onShip) {
                this.collide(event, bodyA.gameObject, bodyB.gameObject);
            } else if (bodyB.gameObject.onShip) {
                this.collide(event, bodyB.gameObject, bodyA.gameObject);
            }
        });

        this.acceptingInfo = this.add.text(0, 0);
        this.angleInfo = this.add.text(0, 20);
        this.bodyInfo = this.add.text(0, 40);

        if (false) {
            this.scene.launch('navInterfaceScene');
            this.controlUi = this.game.scene.getScene('navInterfaceScene');

            // https://github.com/dataarts/dat.gui/blob/master/API.md
            const gui = new dat.GUI();

            gui.add(this.tetrominoL.body, 'angle').listen();
        }

        shapeNames.forEach((name, index) => {
            const emitter = this.add.particles(0, 0, `tetromino-${name}`, {
                lifespan: 25,
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

    collide(event, shipContainer, tetromino) {
        if (angleAcceptable(tetromino.body)) {
            shipContainer.integratePart(tetromino);
        }
    }

    update(_time, deltaMillis) {

        if (this.controlUi) {
            const deltaSeconds = deltaMillis * 0.001;
            const speed = 8 * deltaSeconds;
            const motionDelta = this.controlUi.getControlDelta();

            const deltaX = motionDelta.controlDX * speed;
            const deltaY = motionDelta.controlDY * speed;

            if (!this.physicsContainer.exists(this.tetrominoL)) {
                this.tetrominoL.x += deltaX;
                this.tetrominoL.y += deltaY;
            }
        }

        this.playerShip.update(deltaMillis);
    }
}
