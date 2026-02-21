class Tutorial extends Phaser.Scene {
    constructor() {
        super('tutorialScene');
    }

    create() {
        this.matter.world.disableGravity();

        this.createNUILayer();
        this.createEmitters();

        const callToActionTextStyle = {
            fontFamily: 'aesymatt',
            fontSize: `49px`,
            color: '#FFF'
        };
        this.add.text(gameWidth * 0.5, gameHeight * 0.25, 'Pull the seed towards the sky', callToActionTextStyle).setOrigin(0.5);
    }

    createNUILayer() {
        this.scene.launch('navInterfaceScene');
        this.controlUi = this.game.scene.getScene('navInterfaceScene');
    }

    createEmitters() {
        // Tetromino emitters
        this.emitters = shapeNames.map((name, index) => {
            const emitter = this.add.particles(0, 0, `tetromino-${name}`, {
                lifespan: 500,
                speed: 0,
                scale: 0.25,
                color: [ 0xFF_FF_FF, 0 ],
                emitting: false,
            });
            emitter.setDepth(110 + index);

            this[`emitter${name.toUpperCase()}`] = emitter;
            return emitter;
        });
    }
}