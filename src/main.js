/*
Name: Drullkus

Game Title: Tetromania

Estimate time spent: 30h

Citations:
    aenigma-systematic (aesymatt.ttf) Free Non-commercial https://www.1001freefonts.com/aenigma-systematic.font
    Expoential Decay function "Lerp smoothing is broken" https://www.youtube.com/watch?v=LSNQuFEDOyQ&t=2982s
    Favicon https://www.w3schools.com/html/html_favicon.asp
    huetoRGBInteger https://stackoverflow.com/a/17243070
    Inverse Lerp https://stackoverflow.com/a/39776893
    jsconfig https://code.visualstudio.com/docs/languages/jsconfig
    PhysicsEditor tutorial https://www.codeandweb.com/physicseditor/tutorials/how-to-create-physics-shapes-for-phaser-3-and-matterjs
    Phaser Matter example (with permission from Nick) https://github.com/Nick-Marigo/Matter-Physics/tree/main
    "Retro Arcade Game Music" (no-commercial) https://pixabay.com/music/upbeat-retro-arcade-game-music-297305/
    Tetrominos https://en.wikipedia.org/wiki/Tetromino

Additional notes for grader written inside README.md in root directory
*/

const config = {
    type: Phaser.WEBGL,
    width: 600,
    height: 800,
    useTicker: true,
    scene: [ new Initialize(urlQueryParams.get('mode')), /*PhysicsBox, Rotate, Constraint, Click, Alignment,*/ Credits, MainMenu, PlanetSide, SpaceBackground, Orbit, NavInterface, GameTime, GameOver ],
    parent: 'tetromania',
    // For some reason there's a gap between the bottom of Phaser Canvas and bottom of its parent div.
    canvasStyle: 'margin-bottom: -6px;', // Nasty hack to seal the gap.
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
const controlFocusY = gameHeight * 0.85;

// For easy access via terminal. Access scenes without typing `game.scene.keys.` every time
game.events.once('ready', () => Object.assign(window, game.scene.keys));
