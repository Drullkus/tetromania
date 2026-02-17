class Orbit extends Phaser.Scene {
    constructor() {
        super('orbitScene');
    }

    create() {
        this.matter.world.disableGravity();

        this.createNUILayer();

        const tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.playerShip = new ShipContainer(this, gameWidth * 0.5, gameHeight * 0.5, technologyCollisions['thruster']);
    }

    createNUILayer() {
        this.scene.launch('navInterfaceScene');
        this.controlUi = this.game.scene.getScene('navInterfaceScene');
    }
}