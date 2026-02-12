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
"use strict";

const urlQueryParams = new URLSearchParams(window.location.search);

const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    useTicker: true,
    scene: [ Initialize, PhysicsBox, Click, NavInterface ],
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

function exponentialDecay(a, target, decay, dt) {
    // "Lerp smoothing is broken" https://www.youtube.com/watch?v=LSNQuFEDOyQ&t=2982s
    return target + (a - target) * Math.exp(-decay * dt);
}

// https://stackoverflow.com/a/4467559
function mod(a, b) {
    return ((a % b) + b) % b;
};
