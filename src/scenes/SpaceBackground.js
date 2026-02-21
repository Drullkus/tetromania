class SpaceBackground extends Phaser.Scene {
    constructor() {
        super('spaceBackgroundScene');
        this.imageLayers = [];
    }

    create() {
        this.scrolling = true;

        // Inspired by Factorio https://factorio.com/blog/post/fff-411

        // Each tiled sprite for the background scrolls at different speeds, in the following order:

        // 1. cosmos
        const cosmos = this.addLayer('cosmos', 0.25);
        cosmos.setAlpha(0.333);
    }

    addLayer(imageName, pixelsPerSecond) {
        // blending modes: https://docs.phaser.io/phaser/blend-mode
        const layer = this.add.tileSprite(0, 0, gameWidth, gameHeight, imageName).setOrigin(0, 0).setBlendMode(Phaser.BlendModes.SCREEN);
        this.imageLayers.push({pixelsPerSecond, layer});
        return layer; // For any additional configuration
    }

    shiftLayers(deltaMillis, deltaX, deltaY) {
        this.imageLayers.forEach(({pixelsPerSecond, layer}) => {
            layer.tilePositionX += pixelsPerSecond * deltaMillis * deltaX;
            layer.tilePositionY += pixelsPerSecond * deltaMillis * deltaY;
        })
    }
}
