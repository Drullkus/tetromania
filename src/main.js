/*
Estimate time spent: 3h

Citations:
    Expoential Decay function "Lerp smoothing is broken" https://www.youtube.com/watch?v=LSNQuFEDOyQ&t=2982s
    Favicon https://www.w3schools.com/html/html_favicon.asp
    jsconfig https://code.visualstudio.com/docs/languages/jsconfig
    PhysicsEditor tutorial https://www.codeandweb.com/physicseditor/tutorials/how-to-create-physics-shapes-for-phaser-3-and-matterjs
    Phaser Matter example (with permission from Nick) https://github.com/Nick-Marigo/Matter-Physics/tree/main
    Tetrominos https://en.wikipedia.org/wiki/Tetromino
*/

const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    useTicker: true,
    scene: [ Initialize, PhysicsBox, Rotate, Click, NavInterface ],
    parent: 'tetromania',
    pixelArt: true,
    physics: {
        default: 'matter',
        matter: {
            debug: true
        }
    }
};

const game = new Phaser.Game(config);

const { height: gameHeight, width: gameWidth } = game.config;
