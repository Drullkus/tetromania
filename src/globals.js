"use strict";

const radiansQuarter = Math.PI / 2.0; // 1/4 of a circle
const radiansEigth = Math.PI / 4.0;
const radiansSixteenth = Math.PI / 8.0;
const radiansThirtySecond = Math.PI / 16.0; // 1/32 of a circle

const shapeNames = [ 'i', 'j', 'l', 'o', 's', 't', 'z' ];
const tetrominoNames = shapeNames.map(name => `tetromino-${name}`);

const tetrominoUnitSize = 32;

const urlQueryParams = new URLSearchParams(window.location.search);

function exponentialDecay(a, target, decay, dt) {
    // "Lerp smoothing is broken" https://www.youtube.com/watch?v=LSNQuFEDOyQ&t=2982s
    return target + (a - target) * Math.exp(-decay * dt);
}

// https://stackoverflow.com/a/4467559
function mod(a, b) {
    return ((a % b) + b) % b;
};
