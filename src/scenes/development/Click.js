class Click extends Phaser.Scene {
    constructor() {
        super('clickDevScene');
    }

    create() {
        const tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.matter.add.mouseSpring(); // Allow mouse to pick up and drag objects

        this.thruster = this.add.sprite(0, 0, 'thruster', 0);

        this.playerShip = this.add.container(gameWidth * 0.5, gameHeight * 0.5, [this.thruster]);
        this.playerShip.setSize(this.thruster.width, this.thruster.height);
        this.physicsContainer = this.matter.add.gameObject(this.playerShip, {
            shape: technologyCollisions['thruster'],
            // isStatic: true
        });
        this.physicsContainer.ship = true;

        this.tetrominoL = this.matter.add.sprite(350, 350, 'tetromino-l', 0, {
            shape: tetrominoCollisions['tetromino-l']
        });
        this.tetrominoL.setAngle(5);

        this.tetrominoL.setBelow(this.playerShip);
        this.tetrominoL.ship = false;

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        this.matter.world.disableGravity();

        this.emitter = this.add.particles(0, 0, 'tetromino-j', {
            lifespan: 25,
            speed: 0,
            scale: 0.125,
            color: [ 0xFF_FF_FF, 0 ],
            emitting: false,
        });
        this.emitter.setDepth(100);

        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            if (!(bodyA.gameObject && bodyB.gameObject)) {
                // world bounds has no gameObject
                return;
            }

            if (bodyA.gameObject.ship) {
                this.collide(event, bodyA.gameObject, bodyB.gameObject);
            } else if (bodyB.gameObject.ship) {
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
    }

    collide(event, shipContainer, tetromino) {
        if (angleAcceptable(tetromino.body)) {
            console.log("Collided!");

            tetromino.body.x = 0;
            tetromino.body.y = 0;
            // this.matter.world.remove(tetromino); // Remove from simulation

            tetromino.setAngle(snapCardinalAngleDegrees(tetromino));

            // Readd for display & update
            // this.add.existing(tetromino);
            // tetromino.setBelow(shipContainer);

            shipContainer.add(tetromino);

            // const compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            //     parts: [ ...tetromino.body.parts, ...this.playerShip.body.parts ]
            // });

            // this.playerShip.add(tetromino);
            // this.playerShip.body.parts.push(tetromino.body);
            // this.playerShip.setExistingBody(compoundBody);
            // this.physicsContainer.add(tetromino);

            // TODO Shift to "snap" collision
            // tetromino.displayOriginX += shipContainer.x;
            // tetromino.displayOriginY += shipContainer.y;
            // tetromino.body.positionPrev = tetromino.body.position; // Halt movement
        }
    }

    update(_time, deltaMillis) {
        this.acceptingInfo.text = `angleAcceptable(tetromino.body) = ${angleAcceptable(this.tetrominoL.body)}`;
        this.angleInfo.text = `tetromino.body.angle [deg] = ${this.tetrominoL.angle.toFixed(2)} (Radians ${mod(this.tetrominoL.body.angle, Math.PI * 2.0).toFixed(2)})`;
        this.bodyInfo.text = `tetromino angle if connected: ${snapCardinalAngleDegrees(this.tetrominoL)}`;

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

        getBlockLattice(this.tetrominoL).forEach(({ x, y }) => {
            this.emitter.emitParticleAt(x, y, 1);
        });

        getBlockLattice(this.physicsContainer).forEach(({ x, y }) => {
            this.emitter.emitParticleAt(x, y, 1);
        });
    }
}
