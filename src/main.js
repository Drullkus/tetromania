/*
Citations:
    Favicon https://www.w3schools.com/html/html_favicon.asp
    jsconfig https://code.visualstudio.com/docs/languages/jsconfig
    PhysicsEditor tutorial https://www.codeandweb.com/physicseditor/tutorials/how-to-create-physics-shapes-for-phaser-3-and-matterjs
    Phaser Matter example (with permission from Nick) https://github.com/Nick-Marigo/Matter-Physics/tree/main
    Tetrominos https://en.wikipedia.org/wiki/Tetromino
*/

const urlQueryParams = new URLSearchParams(window.location.search);

const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    useTicker: true,
    scene: [ Initialize, PhysicsTest ],
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

const shapeNames = [ 'i', 'j', 'l', 'o', 's', 't', 'z' ];
const tetrominoNames = shapeNames.map(name => `tetromino-${name}`);
