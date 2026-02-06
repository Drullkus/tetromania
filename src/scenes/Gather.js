class Gather extends Phaser.Scene {
    constructor() {
        super('gatherScene');
    }

    preload() {
        this.load.image('block', './assets/block.png');
    }

    create() {
        this.createBlock(gameWidth * 0.5, gameHeight * 0.5, 1, 4);
    }

    createBlock(x, y, unitWidth, unitHeight) {
        const imageSize = 128;
        this.add.tileSprite(x, y, unitWidth * imageSize, unitHeight * imageSize, 'block').setScale(0.5);
    }

    update() {

    }
}
