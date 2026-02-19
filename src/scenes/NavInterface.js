class NavInterface extends Phaser.Scene {
    constructor() {
        super('navInterfaceScene');
    }

    create() {
        this.focus = new Phaser.Math.Vector2(gameWidth * 0.5, gameHeight * 0.77); // Set lower on screen to uncover center of view
        this.controller = new Controller(this, this.focus, 'controller-circle');
    }

    update(_time, deltaMillis) {
        this.controller.update(deltaMillis);
    }

    getControlDelta() {
        return this.controller.getControlDelta();
    }
}
