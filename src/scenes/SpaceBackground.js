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
        const cosmos = this.addLayer('cosmos', 0.1);
        cosmos.setAlpha(0.25);

        // 2. cosmos but bigger
        const cosmosBig = this.addLayer('cosmos', 0.1);
        cosmosBig.setAlpha(0.2);
        cosmosBig.setScale(1.1);
        cosmosBig.blendMode = 'SCREEN';
        cosmosBig.tilePositionX += centerX;
        cosmosBig.tilePositionY += centerX;

        // 3. distant stars
        const distantStars = this.addLayer('stars', 0.075);
        distantStars.setAlpha(0.5);
        distantStars.setScale(0.75);
        distantStars.blendMode = 'SCREEN';

        // 4. regular stars
        const stars = this.addLayer('stars', 0.125);
        stars.setAlpha(0.75);
        stars.blendMode = 'SCREEN';

        // 5. distant dust
        const distantDust = this.addLayer('space_dust', 0.8);
        distantDust.setScale(4);
        distantDust.setAlpha(0.4);
        distantDust.blendMode = 'SCREEN';

        // 6. dust
        const dust = this.addLayer('space_dust', 1.8);
        dust.setScale(2);
        dust.setAlpha(0.6);
        dust.blendMode = 'SCREEN';

        // TODO Streaks shader
        //  Can't use Rocket Patrol Mod's technical texture, may have to program a regress of 16 of the same texture trailing behind motion
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
