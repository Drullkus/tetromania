class Click extends Phaser.Scene {
    constructor() {
        super('clickScene');
    }

    create() {
        const tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.matter.add.mouseSpring(); // Allow mouse to pick up and drag objects

        this.thruster = this.matter.add.sprite(gameWidth * 0.5, gameHeight * 0.5, 'thruster', 0, {
            shape: technologyCollisions['thruster'],
            isStatic: true
        });
        this.thruster.ship = true;

        this.tetrominoZ = this.matter.add.sprite(200, 200, 'tetromino-z', 0, {
            shape: tetrominoCollisions['tetromino-z']
        });
        this.tetrominoZ.ship = false;
        this.tetrominoZ.body.angle = 0.001;

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        this.matter.world.disableGravity();

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

        this.angleInfo = this.add.text(0, 0);

        const gui = new dat.GUI();

        gui.add(this.tetrominoZ.body, 'angle').listen();
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
        this.angleInfo.text = `angleAcceptable(tetromino.body) = ${this.angleAcceptable(this.tetrominoZ.body)}`;
    }
}
