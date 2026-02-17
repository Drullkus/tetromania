class Controller extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this); // add to existing scene

        this.circleRadius = 32.0;

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

        this.graphics = this.scene.add.graphics();

        this.lineSrc = new Phaser.Math.Vector2(this.affixX, this.affixY);
        this.lineDest = new Phaser.Math.Vector2(this);

        this.dragLine = new Phaser.Curves.Line(this.lineSrc, this.lineDest);
    }

    update(deltaMillis) {
        if (!this.isBeingHeld()) {
            const decayFactor = 0.005;
            const expDecayX = exponentialDecay(this.x, this.affixX, decayFactor, deltaMillis);
            const expDecayY = exponentialDecay(this.y, this.affixY, decayFactor, deltaMillis);
            this.setPosition(expDecayX, expDecayY);
        }

        const dist = this.lineSrc.distance(this);
        if (dist >= this.circleRadius) {
            const offset = new Phaser.Math.Vector2(this)
                .subtract(this.lineSrc)
                .normalize()
                .scale(1 - this.circleRadius);

            // console.log('offset', offset);

            // offset.normalize().scale(dist - this.circleRadius).add(this);

            this.lineDest.setFromObject(offset.add(this));
        } else {
            this.lineDest.setFromObject(this.lineSrc);
        }

        this.graphics.clear();
        this.graphics.lineStyle(2, 0xffffff);
        this.dragLine.draw(this.graphics);
    }

    isBeingHeld() {
        return this.input.dragState == 2;
    }

    getControlDelta() {
        return {
            controlDX: this.x - this.affixX,
            controlDY: this.y - this.affixY
        };
    }
}
