import * as globals from '@src/globals.js';

// http://127.0.0.1:5500/?mode=planetSideScene
// https://drullkus.github.io/tetromania/?mode=planetSideScene
export class PlanetSide extends Phaser.Scene {
    constructor() {
        super('planetSideScene');
    }

    create({ musicTrack }) {
        if (!this.musicTrack) {
            this.musicTrack = musicTrack;
        }

        const bg = this.add.image(...globals.canvasPos(0.5), '__WHITE');
        bg.setDisplaySize(...globals.canvasPos(1.0));
        this.gradient = bg.postFX.addGradient(0x55_AA_00, 0x00_AA_FF, 0);
        this.gradient.fromY = 0.125;
        this.gradient.toY = 0.2;
        this.gradient.size = 32;

        this.createNUILayer();
        this.createEmitters();

        this.instructions();
        this.tutorialTimer = this.time.delayedCall(2000, this.callToPlay, null, this);

        this.rocketSeed = this.add.sprite(...globals.canvasPos(0.5, globals.controlFocusYLerp), 'ship-seed');
        this.rocketSeed.play('ship-seed');
        this.rocketSeed.setDepth(20);

        this.accelY = 0;
        this.speedY = 0;
        this.rocketY = globals.canvasY(globals.controlFocusYLerp);

        this.rocketSound = this.sound.add('rocket');

        this.stars = this.add.image(globals.canvasX(0.5), globals.canvasY(1.0) - 100, 'stars').setBlendMode('SCREEN').setOrigin(0.5, 1).setAlpha(0);

        this.tetrominoLandsDistant = this.add.tileSprite(0, globals.canvasY(1.0) - 200, null, null, 'tetromino_scape');
        this.tetrominoLandsDistant.startingY = this.tetrominoLandsDistant.y;
        this.tetrominoLandsDistant.setOrigin(0, 1);
        this.tetrominoLandsDistant.setScale(20);
        this.tetrominoLandsDistant.tint = 0xCC_CC_CC;

        this.tetrominoLands = this.add.tileSprite(0, globals.canvasY(1.0) - 150, null, null, 'tetromino_scape_flipped');
        this.tetrominoLands.startingY = this.tetrominoLands.y;
        this.tetrominoLands.setOrigin(0, 1);
        this.tetrominoLands.setScale(30);
        this.tetrominoLands.tint = 0xEE_EE_EE;

        this.tetrominoLandsNear = this.add.tileSprite(0, globals.canvasY(1.0) - 100, null, null, 'tetromino_scape');
        this.tetrominoLandsNear.startingY = this.tetrominoLandsNear.y;
        this.tetrominoLandsNear.setOrigin(0, 1);
        this.tetrominoLandsNear.setScale(40);
    }

    createNUILayer() {
        const dragCallback = activated => {
            this.tutorialTimer.delay = 1000;
            this.tutorialTimer.paused = activated;
        };
        this.scene.launch('navInterfaceScene', { pullFactor: 0.00125, dragCallback: dragCallback, cursorRange: Math.max(...globals.canvasPos(1.0)) });
        this.controlUi = this.game.scene.getScene('navInterfaceScene');
    }

    createEmitters() {
        // Tetromino emitters
        this.emitters = globals.shapeNames.map((name, index) => {
            const emitter = this.add.particles(0, 0, `tetromino-${name}`, {
                lifespan: 500,
                angle: { min: 45, max: 135 },
                speed: 100,
                scale: 0.125,
                emitting: false,
            });
            emitter.setDepth(10 + index);

            this[`emitter${name.toUpperCase()}`] = emitter;
            return emitter;
        });
    }

    instructions() {
        const instructionsTextStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '49px',
        };
        this.instructionsText = this.add.text(...globals.canvasPos(0.5, 0.2), 'Fuse with tetrominos.\nAvoid asteroids.', instructionsTextStyle);
        this.instructionsText.setOrigin(0.5);
        this.instructionsText.setStroke('#000', 8);
        this.instructionsText.setDepth(19);
    }

    callToPlay() {
        const callToPlayTextStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '49px',
        };
        this.tutorialText = this.add.text(...globals.canvasPos(0.5, 0.6), 'Pull the seed\nto the sky\nfor blastoff.', callToPlayTextStyle);
        this.tutorialText.setOrigin(0.5);
        this.tutorialText.setStroke('#000', 8);
    }

    update(_time, deltaMillis) {
        const destinationY = -this.rocketSeed.height;
        const progress = globals.inverseLerp(this.rocketSeed.y, this.controlUi.controller.affixY, destinationY);
        const progressSq = progress * progress;

        if (progress >= 1.0) {
            this.exitTutorial();
            return;
        }

        if (this.controlUi.isControlActive()) {
            const pullForce = Math.min(1.0, globals.inverseLerp(this.controlUi.controller.y, this.controlUi.controller.affixY, destinationY));

            this.accelY = globals.exponentialDecay(this.accelY, pullForce * pullForce * 2 + progressSq * 10.0, 0.5, deltaMillis);

            if (pullForce * pullForce > Phaser.Math.RND.frac()) {
                const tetrominoEmitter = this.emitters[Phaser.Math.RND.integerInRange(0, this.emitters.length - 1)];
                tetrominoEmitter.emitParticleAt(this.rocketSeed.x, this.rocketSeed.y + this.rocketSeed.height * 0.33);
            }

            if (!this.rocketSound.isPlaying) {
                this.rocketSound.rate = Phaser.Math.Linear(0.2, 0.8, progress);
                this.rocketSound.detune = Phaser.Math.Linear(-200, 1000, progress);
                this.rocketSound.play();
            }
        } else {
            this.accelY = Math.min(10, this.accelY - 0.25);
        }
        
        this.rocketY = Math.min(globals.canvasY(globals.controlFocusYLerp), this.rocketY - this.accelY);

        this.rocketSeed.y = this.rocketY;
        this.controlUi.controller.lineSrc.y = this.rocketSeed.y;

        this.stars.setAlpha(progress);
        this.tetrominoLandsDistant.y = Phaser.Math.Linear(this.tetrominoLandsDistant.startingY, this.tetrominoLandsDistant.startingY + 200, progressSq);
        this.tetrominoLands.y = Phaser.Math.Linear(this.tetrominoLands.startingY, this.tetrominoLands.startingY + 400, progressSq);
        this.tetrominoLandsNear.y = Phaser.Math.Linear(this.tetrominoLandsNear.startingY, this.tetrominoLandsNear.startingY + 800, progressSq);
        this.gradient.color2 = Phaser.Display.Color.Interpolate.RGBWithRGB(0, 0xAA, 0xFF, 0, 0, 0, 100, Math.round(progressSq * 100)).color;
    }

    exitTutorial() {
        this.scene.stop(this.controlUi);
        // TODO animation to properly transition between scenes
        this.scene.start('orbitScene', { musicTrack: this.musicTrack });
    }
}