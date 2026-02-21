/*
Name: Drullkus

Game Title: Tetromania

Estimate time spent: 30h

Citations:
    Expoential Decay function "Lerp smoothing is broken" https://www.youtube.com/watch?v=LSNQuFEDOyQ&t=2982s
    Favicon https://www.w3schools.com/html/html_favicon.asp
    jsconfig https://code.visualstudio.com/docs/languages/jsconfig
    PhysicsEditor tutorial https://www.codeandweb.com/physicseditor/tutorials/how-to-create-physics-shapes-for-phaser-3-and-matterjs
    Phaser Matter example (with permission from Nick) https://github.com/Nick-Marigo/Matter-Physics/tree/main
    Tetrominos https://en.wikipedia.org/wiki/Tetromino
    aenigma-systematic (aesymatt.ttf) Free Non-commercial https://www.1001freefonts.com/aenigma-systematic.font

Additional notes for grader written inside README.md in root directory
*/

const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    useTicker: true,
    scene: [ Initialize, /*PhysicsBox, Rotate, Constraint, Click, Alignment,*/ Tutorial, Orbit, NavInterface ],
    parent: 'tetromania',
    pixelArt: true,
    physics: {
        default: 'matter',
        matter: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

const { height: gameHeight, width: gameWidth } = game.config;
const centerX = gameWidth * 0.5;
const centerY = gameHeight * 0.5;

const controlFocusX = centerX;
const controlFocusY = gameHeight * 0.77;

// For easy access via terminal. Access scenes without typing `game.scene.keys.` every time
game.events.once('ready', () => Object.assign(window, game.scene.keys));
