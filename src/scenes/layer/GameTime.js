class GameTime extends Phaser.Scene {
    constructor() {
        super('gameTimeScene');
    }

    create() {
        this.stopTimer = false;
        this.playTime = 0;
        this.createTimeText();
    }

    createTimeText() {
        const timerStyle = {
            fontFamily: 'aesymatt',
            fontSize: `60px`,
            color: '#FFF',
            align: 'center'
        };
        
        this.timeTextObj = this.add.text(gameWidth - 20, 20, "0", timerStyle);
        this.timeTextObj.setOrigin(1, 0);
        this.timeTextObj.setStroke("#000", 10);
    }

    createTimeContext() {
        const conTextStyle = {
            fontFamily: 'aesymatt',
            fontSize: `49px`,
            color: '#AAA',
            align: 'center'
        };
        this.conTextTopObj = this.add.text(centerX, gameHeight * 0.45, "Survived for", conTextStyle);
        this.conTextTopObj.setOrigin(0.5);
        this.conTextTopObj.setStroke("#000", 10);
        this.conTextBottomObj = this.add.text(centerX, gameHeight * 0.6, "seconds", conTextStyle);
        this.conTextBottomObj.setOrigin(0.5);
        this.conTextBottomObj.setStroke("#000", 10);
    }

    update() {
        if (!this.stopTimer) {
            this.playTime = this.time.now - this.time.startTime;
            this.timeTextObj.text = (this.playTime * 0.001).toFixed(1);
        }
    }

    stopTime() {
        this.stopTimer = true;
        this.centerText();
    }

    centerText() {
        this.tweens.add({
            targets: this.timeTextObj,

            // Move to center of screen
            x: centerX,
            y: gameHeight * 0.53,
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
