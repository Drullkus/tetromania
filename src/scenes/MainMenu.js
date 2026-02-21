class MainMenu extends Phaser.Scene {
    constructor() {
        super('mainMenuScene');
    }

    create() {
        this.time.delayedCall(1000, this.createTitle, null, this);
        this.time.delayedCall(2000, this.createPlayButton, null, this);
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

        this.createButton("PLAY", gameHeight * 0.6, buttonStyle, this.playButtonPressed);
    }

    createButton(text, yPosition, style, onDown) {
        const textObj = this.add.text(centerX, yPosition, text, style).setOrigin(0.5);
        textObj.setOrigin(0.5);
        textObj.setStroke("#000", 10);
        textObj.setInteractive();

        textObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
            textObj.setBackgroundColor(buttonColorOver);
        });

        textObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
            textObj.setBackgroundColor(buttonColor);
        });

        textObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, onDown, this);

        return textObj;
    }

    playButtonPressed() {
        this.scene.start('tutorialScene');
    }
}
