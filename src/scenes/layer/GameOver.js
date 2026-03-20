// http://127.0.0.1:5500/?mode=gameOverScene
// https://drullkus.github.io/tetromania/?mode=gameOverScene
class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    create({ parentScene, musicTrack }) {
        
        const buttonTextStyle = {
            ...tetromaniaTextStyle,
            fontSize: '49px',
            backgroundColor: buttonColor,
            padding: {
                bottom: 4,
                left: 5,
                right: 7
            }
        };

        this.time.delayedCall(4000, this.revealGameOver, null, this);
        this.time.delayedCall(5000, this.revealMenu, [ buttonTextStyle ], this);
        this.time.delayedCall(5000, this.revealStartOver, [ buttonTextStyle ], this);

        this.parentScene = parentScene;

        if (!this.musicTrack) {
            this.musicTrack = musicTrack;
        }
    }

    revealGameOver() {
        const gameOverStyle = {
            ...tetromaniaTextStyle,
            fontSize: '81px',
        };

        this.gameOverText = this.add.text(centerX, gameHeight * 0.25, 'GAME OVER', gameOverStyle);
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setStroke('#000', 10);
    }

    revealStartOver(buttonTextStyle) {
        this.planetText = this.createButton('REINCARNATE', centerX, gameHeight - 200, buttonTextStyle, this.planetClicked);
    }

    planetClicked() {
        this.scene.stop(this.parentScene.sys.config);

        // TODO move these 2 into an eventlistener? as OrbitScene is stopped
        this.scene.stop('spaceBackgroundScene');
        this.scene.stop('gameTimeScene');

        this.scene.start('planetSideScene');

        this.musicTrack.volume = 0.7;
        this.musicTrack.play(); // Replay from start
    }

    revealMenu(buttonTextStyle) {
        this.menuText = this.createButton('RETURN TO MENU', centerX, gameHeight - 100, buttonTextStyle, this.mainMenuClicked);
    }

    mainMenuClicked() {
        this.scene.stop(this.parentScene.sys.config);

        // TODO move these 2 into an eventlistener? as OrbitScene is stopped
        this.scene.stop('spaceBackgroundScene');
        this.scene.stop('gameTimeScene');

        this.scene.start('mainMenuScene');

        this.musicTrack.volume = 0.7;
        this.musicTrack.play(); // Replay from start
    }
}
