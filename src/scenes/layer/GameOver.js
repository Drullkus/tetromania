import * as globals from '@src/globals.js';

// http://127.0.0.1:5500/?mode=gameOverScene
// https://drullkus.github.io/tetromania/?mode=gameOverScene
export class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    create({ parentSceneName, musicTrack }) {
        
        const buttonTextStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '49px',
            padding: {
                bottom: 4,
                left: 5,
                right: 7
            }
        };

        this.time.delayedCall(4000, this.revealGameOver, null, this);
        this.time.delayedCall(5000, this.revealMenu, [ buttonTextStyle ], this);
        this.time.delayedCall(5000, this.revealStartOver, [ buttonTextStyle ], this);

        this.parentSceneName = parentSceneName ?? 'orbitScene';

        this.musicTrack = musicTrack;
    }

    revealGameOver() {
        const gameOverStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '81px',
        };

        this.gameOverText = this.add.text(...globals.canvasPos(0.5, 0.25), 'GAME OVER', gameOverStyle);
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setStroke('#000', 10);
    }

    revealStartOver(buttonTextStyle) {
        this.planetText = this.createButton('REINCARNATE', globals.canvasX(0.5), globals.canvasY(1.0) - 200, buttonTextStyle, this.planetClicked);
    }

    planetClicked() {
        this.scene.stop(this.parentSceneName);

        // TODO move these 2 into an eventlistener? as OrbitScene is stopped
        this.scene.stop('spaceBackgroundScene');
        this.scene.stop('gameTimeScene');

        this.scene.start('planetSideScene');

        this.musicTrack.volume = 0.7;
        this.musicTrack.play(); // Replay from start
    }

    revealMenu(buttonTextStyle) {
        this.menuText = this.createButton('RETURN TO MENU', globals.canvasX(0.5), globals.canvasY(1.0) - 100, buttonTextStyle, this.mainMenuClicked);
    }

    mainMenuClicked() {
        this.scene.stop(this.parentSceneName);

        // TODO move these 2 into an eventlistener? as OrbitScene is stopped
        this.scene.stop('spaceBackgroundScene');
        this.scene.stop('gameTimeScene');

        this.scene.start('mainMenuScene');

        this.musicTrack.volume = 0.7;
        this.musicTrack.play(); // Replay from start
    }
}
