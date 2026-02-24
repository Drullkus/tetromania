// http://127.0.0.1:5500/?mode=creditsScene
class Credits extends Phaser.Scene {
    constructor() {
        super('creditsScene');
    }

    create() {
        this.time.delayedCall(500, this.createLogo, null, this);
        this.time.delayedCall(1000, this.createCreditsText, null, this);
        this.time.delayedCall(1500, this.createMenuButton, null, this);
    }

    createLogo() {
        const logo = this.add.image(gameWidth * 0.4, gameHeight * 0.4 , 'penrose-triangle');
        logo.setOrigin(0.425, 0.5);
        logo.setScale(3);
        logo.setTint(0xFF_AF_00);
        logo.postFX.addGlow(0x00_00_00, 0, 16, false, 0.1, 16);

        this.tweens.add({
            targets: logo,
            angle: '+=360',
            duration: 60000,
            repeat: -1
        });
    }

    createCreditsText() {
        // What did the developer make?
        const smallCreditsStyle = {
            fontFamily: 'aesymatt',
            fontSize: `49px`,
            color: '#FFF',
            align: 'center'
        };

        this.infoText = this.add.text(centerX, gameHeight * 0.2, 'Code\nArt\nDesign\nSound Effects', smallCreditsStyle);
        this.infoText.setStroke("#000", 8);
        this.infoText.setOrigin(0.5);

        // by me, Drullkus!
        const bigCreditsStyle = {
            fontFamily: 'aesymatt',
            fontSize: `81px`,
            color: '#FFF',
            align: 'center'
        };
        this.authorText = this.add.text(centerX, gameHeight * 0.45, 'produced by\nDRULLKUS', bigCreditsStyle);
        this.authorText.setOrigin(0.5);
        this.authorText.setStroke("#000", 8);

        this.authorText.setAngle(-1.25);

        this.tweens.add({
            targets: this.authorText,
            angle: 1.25,
            ease: 'sine.inout',
            duration: 1000,
            repeat: -1,
            yoyo: true
        });

        // Music credits
        const musicCreditsStyle = {
            fontFamily: 'aesymatt',
            fontSize: `40px`,
            color: '#FFF',
            align: 'center'
        };

        this.musicCreditText = this.add.text(centerX, gameHeight * 0.7, '"Retro Arcade Game Music"\nMusic by MFCC (pixabay.com)', musicCreditsStyle);
        this.musicCreditText.setStroke("#000", 8);
        this.musicCreditText.setOrigin(0.5);
    }

    createMenuButton() {
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
        this.menuText = this.createButton("RETURN TO MENU", gameHeight - 100, buttonStyle, this.mainMenuClicked);
    }

    mainMenuClicked() {
        this.scene.start('mainMenuScene');
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
}
