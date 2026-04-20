import * as globals from '@src/globals.js';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('mainMenuScene');
    }

    create() {
        if (!this.musicTrack) { // Music is globalized across all scenes
            this.musicTrack = this.sound.add('retro_music', { loop: true });
            this.musicTrack.volume = 0.7;
            this.musicTrack.play();
        }

        const buttonStyle = {
            ...globals.tetromaniaTextStyle,
            padding: {
                bottom: 4,
                left: 10,
                right: 14
            }
        };

        this.createTitle();
        this.time.delayedCall(1000, this.createPlayButton, [ buttonStyle ], this);
        this.time.delayedCall(1000, this.createCreditsButton, [ buttonStyle ], this);
    }

    createTitle() {
        const titleStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '100px',
        };

        this.titleText = this.add.text(...globals.canvasPos(0.5, 0.4), 'TETROMANIA', titleStyle).setOrigin(0.5);
        this.titleText.setOrigin(0.5);
        this.titleText.setStroke('#000', 10);
    }

    createPlayButton(defaultButtonStyle) {
        const buttonStyle = {
            ...defaultButtonStyle,
            fontSize: '81px'
        };

        this.createButton('PLAY', ...globals.canvasPos(0.5, 0.6), buttonStyle, this.playButtonPressed);
    }

    createCreditsButton(defaultButtonStyle) {
        const buttonStyle = {
            ...defaultButtonStyle,
            fontSize: '49px'
        };

        this.createButton('CREDITS', ...globals.canvasPos(0.5, 0.9), buttonStyle, this.creditsButtonPressed);
    }

    playButtonPressed() {
        this.scene.start('planetSideScene', { musicTrack: this.musicTrack });
    }

    creditsButtonPressed() {
        this.scene.start('creditsScene');
    }
}
