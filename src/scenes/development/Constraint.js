class Constraint extends Phaser.Scene {
    constructor() {
        super('constraintDevScene');
    }

    create() {
        const tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.matter.add.mouseSpring(); // Allow mouse to pick up and drag objects

        console.log(partCentroids);

        this.thruster = this.matter.add.sprite(gameWidth * 0.5, gameHeight * 0.5, 'thruster', 0, {
            shape: technologyCollisions['thruster'],
            isStatic: true
        });

        const thrusterCentroid = partCentroids['thruster'];
        const tetrominoLCentroid = partCentroids['tetromino-l'];

        this.tetrominoL = this.matter.add.sprite(gameWidth * 0.5 + tetrominoLCentroid.x - thrusterCentroid.x - 32, gameHeight * 0.5 + tetrominoLCentroid.y - thrusterCentroid.y + 32, 'tetromino-l', 0, {
            shape: tetrominoCollisions['tetromino-l']
        });

        this.tetrominoL.setBelow(this.playerShip);

        const dist = Phaser.Math.Distance.BetweenPoints(
            getCoordinatesOfMassCenter(this.thruster),
            getCoordinatesOfMassCenter(this.tetrominoL)
        );

        console.log(getCoordinatesOfMassCenter(this.thruster));
        console.log(getCoordinatesOfMassCenter(this.tetrominoL));
        console.log(`dist: ${dist}`);

        this.matter.add.constraint(this.thruster, this.tetrominoL, Math.ceil(dist), 0);

        

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        this.matter.world.disableGravity();

        this.emitter = this.add.particles(0, 0, 'tetromino-o', {
            lifespan: 1,
            speed: 0,
            scale: 0.125,
            color: [ 0x888888, 0 ],
            emitting: false,
        });

        this.massCenterAInfo = this.add.text(0, 0);
        this.massCenterBInfo = this.add.text(0, 70);
        this.distInfo = this.add.text(0, 140);
    }

    update() {
        this.massCenterAInfo.text = `this.getCoordinatesOfMassCenter(this.thruster) = ${JSON.stringify((getCoordinatesOfMassCenter(this.thruster)), null, 4)}`;
        this.massCenterBInfo.text = `this.getCoordinatesOfMassCenter(this.tetrominoL) = ${JSON.stringify((getCoordinatesOfMassCenter(this.tetrominoL)), null, 4)}`;
        this.distInfo.text = `${Phaser.Math.Distance.BetweenPoints(
            getCoordinatesOfMassCenter(this.thruster),
            getCoordinatesOfMassCenter(this.tetrominoL)
        )}`;

        [
            getCoordinatesOfMassCenter(this.tetrominoL),
            getCoordinatesOfMassCenter(this.thruster)
        ].forEach(({ x, y }) => {
            this.emitter.emitParticleAt(x, y, 1);
        });

        this.tetrominoL.angle = 0;
    }
}
