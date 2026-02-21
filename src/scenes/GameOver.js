class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    create({ parentScene }) {
        this.time.delayedCall(3000, this.revealGameOver, null, this);
        this.time.delayedCall(4000, this.revealMenu, null, this);
        this.time.delayedCall(4000, this.revealStartOver, null, this);

        this.parentScene = parentScene
    }

    revealGameOver() {
        const gameOverStyle = {
            fontFamily: 'aesymatt',
            fontSize: `81px`,
            color: '#FFF',
            align: 'center'
        };

        this.gameOverText = this.add.text(centerX, gameHeight * 0.35, "GAME OVER", gameOverStyle);
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setStroke("#000", 10);
        
        this.startOverStyle = {
            fontFamily: 'aesymatt',
            fontSize: `49px`,
            color: '#FFF',
            align: 'center',
            backgroundColor: buttonColor,
            padding: {
                bottom: 4,
                left: 5,
                right: 7
            }
        };
    }

    revealStartOver() {
        this.planetText = this.createButton("REINCARNATE", gameHeight - 200, this.startOverStyle, this.planetClicked);
    }

    planetClicked() {
        this.scene.stop(this.parentScene.sys.config);
        this.scene.stop('spaceBackgroundScene');
        this.scene.start('planetSideScene');
    }

    revealMenu() {
        this.menuText = this.createButton("RETURN TO MENU", gameHeight - 100, this.startOverStyle, this.mainMenuClicked);
    }

    mainMenuClicked() {
        this.scene.stop(this.parentScene.sys.config);
        this.scene.stop('spaceBackgroundScene');
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
