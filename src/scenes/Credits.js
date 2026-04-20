import * as globals from '@src/globals.js';

// http://127.0.0.1:5500/?mode=creditsScene
// https://drullkus.github.io/tetromania/?mode=creditsScene
export class Credits extends Phaser.Scene {
    constructor() {
        super('creditsScene');
    }

    create() {
        this.time.delayedCall(500, this.createLogo, null, this);
        this.time.delayedCall(1000, this.createCreditsText, null, this);
        this.time.delayedCall(1500, this.createMenuButton, null, this);
    }

    createLogo() {
        const logo = this.add.image(...globals.canvasPos(0.4), 'penrose-triangle');
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
            ...globals.tetromaniaTextStyle,
            fontSize: '49px',
        };

        this.infoText = this.add.text(...globals.canvasPos(0.5, 0.2), 'Code\nArt\nDesign\nSound Effects', smallCreditsStyle);
        this.infoText.setStroke('#000', 8);
        this.infoText.setOrigin(0.5);

        // by me, Drullkus!
        const bigCreditsStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '81px',
        };
        this.authorText = this.add.text(...globals.canvasPos(0.5, 0.45), 'produced by\nDRULLKUS', bigCreditsStyle);
        this.authorText.setOrigin(0.5);
        this.authorText.setStroke('#000', 8);

        this.authorText.setAngle(-1.25);

        this.tweens.add({
            targets: this.authorText,
            angle: 1.25,
            ease: 'sine.inout',
            duration: 1000,
            repeat: -1,
            yoyo: true
        });

        const externalCreditsStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '25px',
        };

        // Font credits
        this.musicCreditText = this.add.text(...globals.canvasPos(0.5, 0.65), '"Aenigma Systematic"\nFont by Brian Kent (1001freefonts.com)', externalCreditsStyle);
        this.musicCreditText.setStroke('#000', 8);
        this.musicCreditText.setOrigin(0.5);

        // Music credits
        this.musicCreditText = this.add.text(...globals.canvasPos(0.5, 0.75), '"Retro Arcade Game Music"\nMusic by MFCC (pixabay.com)', externalCreditsStyle);
        this.musicCreditText.setStroke('#000', 8);
        this.musicCreditText.setOrigin(0.5);
    }

    createMenuButton() {
        const buttonStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '49px',
            padding: {
                bottom: 4,
                left: 10,
                right: 14
            }
        };
        this.menuText = this.createButton('RETURN TO MENU', globals.canvasX(0.5), globals.canvasY(1.0) - 100, buttonStyle, this.mainMenuClicked);
    }

    mainMenuClicked() {
        this.scene.start('mainMenuScene');
    }
}
