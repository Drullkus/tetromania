class Controller extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this); // add to existing scene

        // The position that this object gravitates towards when let go
        this.affixX = x;
        this.affixY = y;

        this.setInteractive({
            useHandCursor: true,
            hitArea: Phaser.Geom.Circle.Contains,
            draggable: true
        });

        this.on('drag', (_pointer, x, y) => {
            this.setPosition(x, y);
        });
    }

    update(deltaMillis) {
        if (!this.isBeingHeld()) {
            const decayFactor = 0.005;
            const expDecayX = exponentialDecay(this.x, this.affixX, decayFactor, deltaMillis);
            const expDecayY = exponentialDecay(this.y, this.affixY, decayFactor, deltaMillis);
            this.setPosition(expDecayX, expDecayY);
        }
    }

    isBeingHeld() {
        return this.input.dragState == 2;
    }

    getControlDelta() {
        return {
            deltaX: this.x - this.affixX,
            deltaY: this.y - this.affixY
        };
    }
}
