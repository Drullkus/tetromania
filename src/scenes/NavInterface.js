class NavInterface extends Phaser.Scene {
    constructor() {
        super('navInterfaceScene');

        this.focusX = gameWidth * 0.5;
        this.focusY = gameHeight * 0.77; // Set lower on screen to uncover center of view
    }

    create() {
        this.controller = new Controller(this, this.focusX, this.focusY, 'controller-circle');

        this.graphics = this.add.graphics();

        this.dragLine = new Phaser.Curves.Line(new Phaser.Math.Vector2(this.focusX, this.focusY), this.controller);
    }

    update(_time, deltaMillis) {
        this.controller.update(deltaMillis);

        this.graphics.clear();
        this.graphics.lineStyle(3, 0xffffff);
        this.dragLine.draw(this.graphics);
    }

    getControlDelta() {
        return this.controller.getControlDelta();
    }
}
