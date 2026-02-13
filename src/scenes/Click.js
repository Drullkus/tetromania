class Click extends Phaser.Scene {
    constructor() {
        super('clickScene');
    }

    create() {
        this.tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.matter.add.mouseSpring(); // Allow mouse to pick up and drag objects

        this.thruster = this.matter.add.sprite(gameWidth * 0.5, gameHeight * 0.5, 'thruster', 0, {
            shape: technologyCollisions['thruster'],
            isStatic: true
        });
        this.thruster.ship = true;

        this.tetrominoL = this.matter.add.sprite(200, 200, 'tetromino-l', 0, {
            shape: this.tetrominoCollisions['tetromino-l']
        });
        this.tetrominoL.ship = false;
        this.tetrominoL.body.angle = 0.01;

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        this.matter.world.disableGravity();

        this.emitter = this.add.particles(0, 0, 'tetromino-j', {
            lifespan: 100,
            speed: 0,
            scale: 0.125,
            color: [ 0x888888, 0 ],
            emitting: false,
        });

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

        // https://github.com/dataarts/dat.gui/blob/master/API.md
        const gui = new dat.GUI();

        gui.add(this.tetrominoL.body, 'angle').listen();
    }

    collide(event, ship, tetromino) {
        if (this.angleAcceptable(tetromino.body)) {
            console.log("TODO do click");

            // TODO Glue to Thruster
        }
    }

    angleAcceptable(body) {
        const realigned = body.angle + radiansEigth;
        const radiansFromQuarter = mod(realigned, Math.PI * 0.5) - radiansEigth
        const accepted = Math.abs(radiansFromQuarter) <= radiansThirtySecond;
        return accepted;
    }

    update() {
        this.acceptingInfo.text = `angleAcceptable(tetromino.body) = ${this.angleAcceptable(this.tetrominoL.body)}`;
        this.angleInfo.text = `tetromino.body.angle [deg] = ${this.tetrominoL.angle.toFixed(2)} (Radians ${mod(this.tetrominoL.body.angle, Math.PI * 2.0).toFixed(2)})`;

        extractUnits(this.tetrominoL).forEach(({ x, y }) => {
            this.bodyInfo.text = `tetromino.body: ${x} ${y}`;
            this.emitter.emitParticleAt(x, y, 1);
        });

        extractUnits(this.thruster).forEach(({ x, y }) => {
            this.bodyInfo.text = `tetromino.body: ${x} ${y}`;
            this.emitter.emitParticleAt(x, y, 1);
        });
    }
}
