class MainMenu extends Phaser.Scene {
    constructor() {
        super('mainMenuScene');
    }

    create() {
        if (!this.musicTrack) {
            this.musicTrack = this.sound.add('retro_music', { loop: true });
            this.musicTrack.volume = 0.7;
            this.musicTrack.play();
        }

        this.createTitle();
        this.time.delayedCall(1000, this.createPlayButton, null, this);
        this.time.delayedCall(1000, this.createCreditsButton, null, this);
    }

    createTitle() {
        const titleStyle = {
            fontFamily: 'aesymatt',
            fontSize: `100px`,
            color: '#FFF',
            align: 'center'
        };

        this.titleText = this.add.text(centerX, gameHeight * 0.4, "TETROMANIA", titleStyle).setOrigin(0.5);
        this.titleText.setOrigin(0.5);
        this.titleText.setStroke("#000", 10);
        this.titleText.setInteractive();
    }

    createPlayButton() {
        const buttonStyle = {
            fontFamily: 'aesymatt',
            fontSize: `81px`,
            color: '#FFF',
            align: 'center',
            backgroundColor: buttonColor,
            padding: {
                bottom: 4,
                left: 10,
                right: 14
            }
        };

        this.createButton("PLAY", centerX, gameHeight * 0.6, buttonStyle, this.playButtonPressed);
    }

    createCreditsButton() {
        const buttonStyle = {
            fontFamily: 'aesymatt',
            fontSize: `49px`,
            color: '#FFF',
            align: 'center',
            backgroundColor: buttonColor,
            padding: {
                bottom: 4,
                left: 10,
                right: 14
            }
        };

        this.createButton("CREDITS", centerX, gameHeight * 0.9, buttonStyle, this.creditsButtonPressed);
    }

    playButtonPressed() {
        this.scene.start('planetSideScene', { musicTrack: this.musicTrack });
    }

    creditsButtonPressed() {
        this.scene.start('creditsScene');
    }
}
