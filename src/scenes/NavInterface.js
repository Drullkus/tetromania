class NavInterface extends Phaser.Scene {
    constructor() {
        super('navInterfaceScene');

        this.focusX = gameWidth * 0.5;
        this.focusY = gameHeight * 0.77; // Set lower on screen to uncover center of view
    }

    create() {
        this.controller = new Controller(this, this.focusX, this.focusY, 'controller-circle');
    }

    update(_time, deltaMillis) {
        this.controller.update(deltaMillis);
    }

    getControlDelta() {
        return this.controller.getControlDelta();
    }
}
