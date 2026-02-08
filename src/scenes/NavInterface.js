class NavInterface extends Phaser.Scene {
    constructor() {
        super('controlInterfaceScene');
    }

    create() {
        const controlX = gameWidth * 0.5;
        const controlY = gameHeight * 0.77; // Set lower on screen to uncover center of view
        this.controller = new Controller(this, controlX, controlY, 'controller-circle');
    }

    update(_time, deltaMillis) {
        this.controller.update(deltaMillis);
    }

    getControlDelta() {
        return this.controller.getControlDelta();
    }
}
