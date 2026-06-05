'use strict';

import { Initialize } from "./scenes/Initialize.js";
import { MainMenu } from "./scenes/MainMenu.js";
import { Credits } from "./scenes/Credits.js";
import { PlanetSide } from "./scenes/PlanetSide.js";
import { SpaceBackground } from "./scenes/layer/SpaceBackground.js";
import { Orbit } from "./scenes/Orbit.js";
import { NavInterface } from "./scenes/layer/NavInterface.js";
import { GameTime } from "./scenes/layer/GameTime.js";
import { GameOver } from "./scenes/layer/GameOver.js";

const urlQueryParams = new URLSearchParams(window.location.search);

const config = {
    type: Phaser.WEBGL,
    width: 600,
    height: 800,
    useTicker: true,
    scene: [ new Initialize(urlQueryParams.get('mode')), /*PhysicsBox, Rotate, Constraint, Click, Alignment,*/ Credits, MainMenu, PlanetSide, SpaceBackground, Orbit, NavInterface, GameTime, GameOver ],
    parent: 'tetromania',
    canvasStyle: 'display: block;', // Set to block, as otherwise it will have a 6-pixel gap underneath
    pixelArt: true,
    physics: {
        default: 'matter',
        matter: {
            debug: false
        }
    }
};

export const game = new Phaser.Game(config);

// Allow all scenes to be accessible via browser console
game.events.once('ready', () => Object.assign(window, game.scene.keys));

// Add the phaser game object to window as well, so that it can be accessed via browser console,
//  despite js moding for modules instead of globals
window.game = game;
