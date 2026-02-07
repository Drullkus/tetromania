class ControlInterface extends Phaser.Scene {
    constructor() {
        super('controlInterfaceScene');
    }

    create() {
        this.centerX = gameWidth * 0.5;
        this.centerY = gameHeight * 0.5;

        this.controller = this.add.sprite(this.centerX, this.centerY, 'controller-circle');

        this.controller.setInteractive({
            useHandCursor: true,
            hitArea: Phaser.Geom.Circle.Contains,
            draggable: true
        });

        this.controller.on('drag', (_pointer, x, y) => {
            this.controller.setPosition(x, y);
        });
    }

    update(_time, deltaMillis) {
        if (!this.isDraggingControl()) {
            const decayFactor = 0.005;
            const expDecayX = exponentialDecay(this.controller.x, this.centerX, decayFactor, deltaMillis);
            const expDecayY = exponentialDecay(this.controller.y, this.centerY, decayFactor, deltaMillis);
            this.controller.setPosition(expDecayX, expDecayY);
        }
    }

    isDraggingControl() {
        return this.controller.input.dragState == 2;
    }

    getControlDelta() {
        return {
            deltaX: this.controller.x - this.centerX,
            deltaY: this.controller.y - this.centerY
        };
    }
}
