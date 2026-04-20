import * as globals from '@src/globals.js';

// http://127.0.0.1:5500/?mode=gameTimeScene
// https://drullkus.github.io/tetromania/?mode=gameTimeScene
export class GameTime extends Phaser.Scene {
    constructor() {
        super('gameTimeScene');
    }

    create() {
        this.stopTimer = false;
        this.playTime = 0; // Measured in tenths of seconds  (decisecond)
        this.previousHighscoreTime = globals.getTimeHighScore();
        this.hasNewHighscore = false;
        this.highscoreTextObj = null;

        this.createTimeText();
    }

    createTimeText() {
        const timerStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '60px',
        };
        
        this.timeTextObj = this.add.text(globals.canvasX(1.0) - 15, 60, '0', timerStyle);
        this.timeTextObj.setOrigin(1, 0);
        this.timeTextObj.setStroke('#000', 10);

        const highScoreStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '30px',
        };
        
        this.highscoreTimeTextObj = this.add.text(globals.canvasX(1.0) - 15, 20, `high score ${(this.previousHighscoreTime * 0.1).toFixed(1)}`, highScoreStyle);
        this.highscoreTimeTextObj.setOrigin(1.0, 0.0);
        this.highscoreTimeTextObj.setStroke('#000', 10);
    }

    createTimeContext() {
        const conTextStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '49px',
            color: '#AAA',
        };
        this.conTextTopObj = this.add.text(...globals.canvasPos(0.5, 0.45), 'survived for', conTextStyle);
        this.conTextTopObj.setOrigin(0.5);
        this.conTextTopObj.setStroke('#000', 10);
        this.conTextBottomObj = this.add.text(...globals.canvasPos(0.5, 0.6), 'seconds', conTextStyle);
        this.conTextBottomObj.setOrigin(0.5);
        this.conTextBottomObj.setStroke('#000', 10);

        if (this.hasNewHighscore) {
            this.tweens.add({
                targets: this.highscoreTimeTextObj,
                y: -40,
                duration: 1000,
                ease: 'linear'
            });
            this.time.delayedCall(1000, this.createHighScoreText, null, this);
        }
    }

    createHighScoreText() {
        const highscoreStyle = {
            ...globals.tetromaniaTextStyle,
            fontSize: '60px',
        };
        this.highscoreTextObj = this.add.text(...globals.canvasPos(0.5, 0.36), 'new high score!', highscoreStyle);
        this.highscoreTextObj.setOrigin(0.5);
        this.highscoreTextObj.setStroke('#000', 10);
    }

    update() {
        if (!this.stopTimer) {
            this.playTime = Math.floor(this.getTimeSinceStart() * 0.01);
            this.timeTextObj.text = (this.playTime * 0.1).toFixed(1);
        }

        if (this.highscoreTextObj) {
            const colorHex = globals.huetoHexCode(this.time.now * 0.00067);
            this.highscoreTextObj.setColor(colorHex);
        }
    }

    getTimeSinceStart() {
        // In Milliseconds
        return this.time.now - this.time.startTime;
    }

    stopTime() {
        this.stopTimer = true;
        this.centerText();
        if (this.playTime > this.previousHighscoreTime) {
            this.hasNewHighscore = true;
            globals.setTimeHighScore(this.playTime);
        }
    }

    centerText() {
        this.tweens.add({
            targets: this.timeTextObj,

            // Move to center of screen
            x: globals.canvasX(0.5),
            y: globals.canvasY(0.53),
            // Also shift object origin
            originX: 0.5,
            originY: 0.5,

            duration: 2000,
            repeat: 0,
            ease: 'cubic.inout',
            onUpdate: () => {
                // Required if an objects origin is shifted
                this.timeTextObj.updateDisplayOrigin();
            },
            onComplete: () => {
                this.createTimeContext();
            }
        });
    }
}
