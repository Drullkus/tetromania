class Controller extends Phaser.GameObjects.Sprite {
    constructor(scene, focus, texture, frame) {
        super(scene, focus.x, focus.y, texture, frame);

        scene.add.existing(this); // add to existing scene

        this.setAlpha(1.0);

        this.circleRadius = 32.0;

        // The position that this object gravitates towards when let go
        this.affixX = focus.x;
        this.affixY = focus.y;
        this.setCursorPullFactor(0.05);

        this.setInteractive({
            useHandCursor: true,
            hitArea: Phaser.Geom.Circle.Contains,
            draggable: true
        });

        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.resetTargetPos);
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG, this.drag);

        this.graphics = this.scene.add.graphics();

        this.lineSrc = new Phaser.Math.Vector2(this.affixX, this.affixY);
        this.lineDest = new Phaser.Math.Vector2(this);

        this.dragLine = new Phaser.Curves.Line(this.lineSrc, this.lineDest);

        this.dragCallback = _activatedState => {};
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_START, () => this.dragCallback(true));
        this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_END, () => this.dragCallback(false));
    }

    setCursorPullFactor(decayFactor) {
        this.pullFactor = decayFactor;
    }

    drag(pointer) {
        this.setTargetPos(pointer.position.x, pointer.position.y);
    }

    setTargetPos(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    resetTargetPos() {
        this.targetX = this.affixX;
        this.targetY = this.affixY;
    }

    update(deltaMillis) {
        if (this.isBeingHeld()) {
            const expDecayX = exponentialDecay(this.x, this.targetX, this.pullFactor, deltaMillis);
            const expDecayY = exponentialDecay(this.y, this.targetY, this.pullFactor, deltaMillis);
            this.setPosition(expDecayX, expDecayY);
        } else {
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

    getControlPos() {
        return {
            x: this.x,
            y: this.y
        };
    }

    setAlphaLevel(alpha) {
        this.setAlpha(alpha);
        this.graphics.setAlpha(alpha);
    }
}
