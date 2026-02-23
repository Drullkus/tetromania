// http://127.0.0.1:5500/?mode=gameOverScene
class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    create({ parentScene, musicTrack }) {
        this.time.delayedCall(4000, this.revealGameOver, null, this);
        this.time.delayedCall(5000, this.revealMenu, null, this);
        this.time.delayedCall(5000, this.revealStartOver, null, this);

        this.parentScene = parentScene

        if (!this.musicTrack) {
            this.musicTrack = musicTrack;
        }
    }

    revealGameOver() {
        const gameOverStyle = {
            fontFamily: 'aesymatt',
            fontSize: `81px`,
            color: '#FFF',
            align: 'center'
        };

        this.gameOverText = this.add.text(centerX, gameHeight * 0.25, "GAME OVER", gameOverStyle);
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

        // TODO move these 2 into an eventlistener? as OrbitScene is stopped
        this.scene.stop('spaceBackgroundScene');
        this.scene.stop('gameTimeScene');

        this.scene.start('planetSideScene');

        this.musicTrack.volume = 0.7;
    }

    revealMenu() {
        this.menuText = this.createButton("RETURN TO MENU", gameHeight - 100, this.startOverStyle, this.mainMenuClicked);
    }

    mainMenuClicked() {
        this.scene.stop(this.parentScene.sys.config);

        // TODO move these 2 into an eventlistener? as OrbitScene is stopped
        this.scene.stop('spaceBackgroundScene');
        this.scene.stop('gameTimeScene');

        this.scene.start('mainMenuScene');

        this.musicTrack.volume = 0.7;
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
