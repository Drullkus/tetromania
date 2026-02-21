class Tutorial extends Phaser.Scene {
    constructor() {
        super('tutorialScene');
    }

    create() {
        this.matter.world.disableGravity();
        this.matter.world.pause(); // Don't need this running

        const bg = this.add.image(centerX, centerY, '__WHITE');
        bg.setDisplaySize(gameWidth + 4, gameHeight + 4);
        const gradient = bg.postFX.addGradient(0x55_AA_00, 0x00_00_FF, 0);
        gradient.size = 32;

        this.createNUILayer();
        this.createEmitters();

        const callToActionTextStyle = {
            fontFamily: 'aesymatt',
            fontSize: `49px`,
            color: '#FFF',
            align: 'center'
        };
        this.tutorialText = this.add.text(gameWidth * 0.5, gameHeight * 0.25, 'Pull the seed\ntowards the sky', callToActionTextStyle).setOrigin(0.5);

        this.rocketSeed = this.add.sprite(controlFocusX, controlFocusY, 'thruster');
        this.rocketSeed.setScale(0.5);
        this.rocketSeed.setDepth(20);

        this.accelY = 0;
        this.speedY = 0;
        this.rocketY = controlFocusY;
    }

    createNUILayer() {
        this.scene.launch('navInterfaceScene', { pullFactor: 0.00125 });
        this.controlUi = this.game.scene.getScene('navInterfaceScene');
    }

    createEmitters() {
        // Tetromino emitters
        this.emitters = shapeNames.map((name, index) => {
            const emitter = this.add.particles(0, 0, `tetromino-${name}`, {
                lifespan: 500,
                angle: { min: 45, max: 135 },
                speed: 100,
                scale: 0.25,
                emitting: false,
            });
            emitter.setDepth(10 + index);

            this[`emitter${name.toUpperCase()}`] = emitter;
            return emitter;
        });
    }

    update(_time, deltaMillis) {
        const destinationY = -this.rocketSeed.height;
        const progress = inverseLerp(this.rocketSeed.y, this.controlUi.controller.affixY, destinationY);

        if (progress >= 1.0) {
            this.exitTutorial();
            return;
        }

        if (this.controlUi.isControlActive()) {
            const pullForce = Math.min(1.0, inverseLerp(this.controlUi.controller.y, this.controlUi.controller.affixY, destinationY));

            this.accelY = exponentialDecay(this.accelY, pullForce * pullForce * 2 + progress * progress * 10.0, 0.5, deltaMillis);

            if (pullForce * pullForce > Phaser.Math.RND.frac() * 2.0) {
                const tetrominoEmitter = this.emitters[Phaser.Math.RND.integerInRange(0, this.emitters.length - 1)];
                tetrominoEmitter.emitParticleAt(this.rocketSeed.x, this.rocketSeed.y + this.rocketSeed.height * 0.25);
                // emittedTetromino.velocityX(Phaser.Math.RND.realInRange(-2, 2))
                // emittedTetromino.velocityY(Phaser.Math.RND.realInRange(0, 4))
            }
        } else {
            this.accelY = Math.min(10, this.accelY - 0.25);
        }
        
        this.rocketY = Math.min(controlFocusY, this.rocketY - this.accelY);

        this.rocketSeed.y = this.rocketY;
        this.controlUi.controller.lineSrc.y = this.rocketSeed.y;
    }

    exitTutorial() {
        this.scene.stop(this.controlUi);
        // TODO animation to properly transition between scenes
        this.scene.start('orbitScene');
    }
}