// For testing physics
class PhysicsBox extends Phaser.Scene {
    constructor() {
        super('physicsBoxScene');
    }

    create() {
        const tetrominoCollisions = this.cache.json.get('tetromino_collision');

        this.tetrominoes = tetrominoNames.map((tetrominoName, index) => {
            return this.matter.add.sprite(150 * (index % 4) + 75, 150 * Math.floor(index / 4) + 75, tetrominoName, 0, {
                shape: tetrominoCollisions[tetrominoName]
            });
        });

        const technologyCollisions = this.cache.json.get('technology_collision');

        this.thruster = this.matter.add.sprite(gameWidth * 0.5, gameHeight * 0.5, 'thruster', 0, {
            shape: technologyCollisions['thruster'],
            isStatic: true
        });

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        this.matter.world.disableGravity();

        this.scene.launch('navInterfaceScene');
        this.controlUi = this.game.scene.getScene('navInterfaceScene');
    }

    update(_time, deltaMillis) {
        const deltaSeconds = deltaMillis * 0.001;
        const speed = 8 * deltaSeconds;
        const motionDelta = this.controlUi.getControlDelta();

        const deltaX = motionDelta.controlDX * speed;
        const deltaY = motionDelta.controlDY * speed;
        
        this.tetrominoes.forEach(tetromino => {
            // tetromino.setVelocity(deltaX, deltaY);
            tetromino.x += deltaX;
            tetromino.y += deltaY;
        });
    }
}
