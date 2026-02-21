class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    create({ parentScene }) {
        const gameOverStyle = {
            fontFamily: 'aesymatt',
            fontSize: `81px`,
            color: '#FFF',
            align: 'center'
        };

        this.gameOverText = this.add.text(centerX, centerY, "GAME OVER", gameOverStyle);
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setStroke("#000", 10);

        this.startOverPlanet = this.time.delayedCall(1000, this.revealStartOver, null, this);

        this.parentScene = parentScene
    }

    revealStartOver() {
        const startOverStyle = {
            fontFamily: 'aesymatt',
            fontSize: `49px`,
            color: '#FFF',
            align: 'center',
            backgroundColor: '#2d2d2d',
            padding: {
                bottom: 4,
                left: 5,
                right: 7
            }
        };

        this.createButton(gameHeight - 100, startOverStyle);
    }

    createButton(yPosition, startOverStyle) {
        this.menuText = this.add.text(centerX, yPosition, "RETURN TO MENU", startOverStyle).setOrigin(0.5);
        this.menuText.setOrigin(0.5);
        this.menuText.setStroke("#000", 10);
        this.menuText.setInteractive();

        this.menuText.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
            this.menuText.setBackgroundColor('#8d8d8d');
        });

        this.menuText.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
            this.menuText.setBackgroundColor('#2d2d2d');
        });

        this.menuText.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.mainMenuClicked, this);
    }

    mainMenuClicked() {
        this.scene.stop(this.parentScene.sys.config);
        this.scene.start('tutorialScene'); // FIXME switch for Main Menu
    }

    planetClicked() {
        this.scene.stop(this.parentScene.sys.config);
        this.scene.start('tutorialScene');
    }
}
