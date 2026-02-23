class NavInterface extends Phaser.Scene {
    constructor() {
        super('navInterfaceScene');
    }

    create({ pullFactor, dragCallback, cursorRange }) {
        this.focus = new Phaser.Math.Vector2(controlFocusX, controlFocusY); // Set lower on screen to uncover center of view
        this.controller = new Controller(this, this.focus, 'controller-circle', null, cursorRange);

        this.controller.dragCallback = dragCallback;
        this.controller.setCursorPullFactor(pullFactor);

        this.transparent = false;
    }

    update(_time, deltaMillis) {
        this.controller.update(deltaMillis);

        if (this.transparent) {
            const priorAlpha = this.controller.alpha;
            if (priorAlpha > 0.001) {
                this.controller.setAlphaLevel(exponentialDecay(priorAlpha, 0, 0.0075, deltaMillis));
            }
        }
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

    disableControl() {
        this.transparent = true;
        this.controller.disableInteractive(true);
    }
}
