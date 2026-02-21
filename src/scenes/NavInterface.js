class NavInterface extends Phaser.Scene {
    constructor() {
        super('navInterfaceScene');
    }

    create({ pullFactor }) {
        this.focus = new Phaser.Math.Vector2(controlFocusX, controlFocusY); // Set lower on screen to uncover center of view
        this.controller = new Controller(this, this.focus, 'controller-circle');

        pullFactor && this.controller.setCursorPullFactor(pullFactor);
    }

    update(_time, deltaMillis) {
        this.controller.update(deltaMillis);
    }

    getControlDelta() {
        return this.controller.getControlDelta();
    }

    getControlPos() {
        return this.controller.getControlPos();
    }

    isControlActive() {
        return this.controller.isBeingHeld();
    }
}
