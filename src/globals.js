"use strict";

const radiansFull = Math.PI * 2.0;
const radiansHalf = Math.PI;
const radiansQuarter = Math.PI / 2.0; // 1/4 of a circle
const radiansEigth = Math.PI / 4.0;
const radiansSixteenth = Math.PI / 8.0;
const radiansThirtySecond = Math.PI / 16.0; // 1/32 of a circle

const degreesFull = 360.0
const degreesHalf = 180.0;
const degreesQuarter = 90.0;
const degreesEigth = 45.0;
const degreesSixteenth = 22.5;
const degreesThirtySecond = 11.25;

const shapeNames = [ 'i', 'j', 'l', 'o', 's', 't', 'z' ];
const tetrominoNames = shapeNames.map(name => `tetromino-${name}`);

const tetrominoUnitSize = 32;

const urlQueryParams = new URLSearchParams(window.location.search);

/** "Lerp smoothing is broken" https://www.youtube.com/watch?v=LSNQuFEDOyQ&t=2982s */
function exponentialDecay(a, target, decay, dt) {
    return target + (a - target) * Math.exp(-decay * dt);
}

/** True modulo, as JS's % remainder operator can make negatives. https://stackoverflow.com/a/4467559 */
function mod(a, b) {
    return ((a % b) + b) % b;
}

/** Gets cardinal angle from object, returning 0, 90, 180, 270 */
function snapCardinalAngleDegrees(gameObject) {
    return mod(Math.round(gameObject.angle / degreesQuarter) * degreesQuarter, degreesFull);
}

/** Gets cardinal angle from object, returning 0, PI/2, PI, or 3PI/2 */
function snapCardinalAngleRadians(gameObject) {
    return mod(Math.round(gameObject.angle / radiansQuarter) * radiansQuarter, radiansFull);
}

/** Determines if the tetromino is elible to connect with ship */
function angleAcceptable(body) {
    if (!body) return 0;
    const radiansInsideQuarter = mod(body.angle + radiansEigth, radiansQuarter) - radiansEigth;
    return Math.abs(radiansInsideQuarter) <= radiansThirtySecond;
}

/**
 * Extract units of a tetromino body. Registers a point for every center of 32-wide units in the body.
 * Returns a list of grid-cell center positions, all located in scene space.
 * */
function getBlockLattice(tetromino) {
    // Get angle
    const angle = tetromino.body.angle;

    // Construct rotation matrix
    const mat2 = Matrix2.rotationMatrix(angle);

    // Tetromino's sprite dimensions
    const tetrominoWidth = tetromino.width;
    const tetrominoHeight = tetromino.height;

    // Tetromino's tile width and height
    const tileWidth = Math.round(tetrominoWidth / tetrominoUnitSize);
    const tileHeight = Math.round(tetrominoHeight / tetrominoUnitSize);

    // The scene position of this piece's pivot point
    const objX = tetromino.x;
    const objY = tetromino.y;
    // Tetromino's central pivot in pixel space inside sprite bounds
    const pixotX = tetromino.body.centerOffset.x;
    const pixotY = tetromino.body.centerOffset.y;

    // Rotation-relative scene position of the sprite's top-left corner
    const offsetFromPivotToTopLeftX = objX - mat2.multiplyVectorX(pixotX, pixotY);
    const offsetFromPivotToTopLeftY = objY - mat2.multiplyVectorY(pixotX, pixotY);

    // "Crawl" for scene positions of each block in the tetromino
    const positions = [];
    // Loop over entire lattice within sprite bounds
    for (let tileY = 0.5; tileY < tileHeight; tileY++) {
        for (let tileX = 0.5; tileX < tileWidth; tileX++) {
            const rotatedX = mat2.multiplyVectorX(tileX, tileY) * tetrominoUnitSize + offsetFromPivotToTopLeftX;
            const rotatedY = mat2.multiplyVectorY(tileX, tileY) * tetrominoUnitSize + offsetFromPivotToTopLeftY;
            // Include only if lattice point actually contained inside physical body
            if (tetromino.scene.matter.containsPoint(tetromino.body, rotatedX, rotatedY)) {
                positions.push({ x: rotatedX, y: rotatedY });
            }
        }
    }

    return positions;
}

/**
 * Snaps tetromino to the ship container
 */
function snapPieceToShip(shipContainer, tetromino) {
    // TODO get origin of tetromino to ship container
    // TODO offset vector where X and Y are less than tetrominoUnitSize (32)
    // TODO return container-relative offset vector that lines the piece to first piece in the container list
}
