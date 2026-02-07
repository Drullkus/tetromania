// For testing physics
class PhysicsBox extends Phaser.Scene {
    constructor() {
        super('physicsBoxScene');
    }

    create() {
        const tetrominoCollisions = this.cache.json.get('tetromino_collision');

        //this.matter.add.mouseSpring(); // Allow mouse to pick up and drag objects

        this.tetrominoes = tetrominoNames.map((tetrominoName, index) => {
            return this[tetrominoName] = this.matter.add.sprite(150 * (index % 4) + 75, 150 * Math.floor(index / 4) + 75, tetrominoName, 0, {
                shape: tetrominoCollisions[tetrominoName]
            });
        });

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        this.matter.world.disableGravity();

        this.scene.launch('controlInterfaceScene');
        this.controlUi = this.game.scene.getScene('controlInterfaceScene');
    }

    update() {
        const { deltaX, deltaY } = this.controlUi.getControlDelta();
        const speed = 0.05;
        this.tetrominoes.forEach(tetromino => {
            tetromino.setVelocity(deltaX * speed, deltaY * speed);
        });
    }
}
