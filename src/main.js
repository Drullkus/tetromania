/*
Citations:
    Favicon https://www.w3schools.com/html/html_favicon.asp
    jsconfig https://code.visualstudio.com/docs/languages/jsconfig
*/

const urlQueryParams = new URLSearchParams(window.location.search);

const config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    useTicker: true,
    scene: [ Gather ],
    parent: 'tetromania',
    pixelArt: true
};

const game = new Phaser.Game(config);

const { height: gameHeight, width: gameWidth } = game.config;
