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

const radiansToDegrees = 180 / Math.PI;
const degreesToRadians = Math.PI / 180;

const shapeNames = [ 'i', 'j', 'l', 'o', 's', 't', 'z' ];
const tetrominoNames = shapeNames.map(name => `tetromino-${name}`);
const techNames = [ 'thruster' ];
const partNames = [ ...tetrominoNames, ...techNames ];

const tetrominoUnitSize = 32;
const buttonColor = '#2d2d2d';
const buttonColorOver = '#8d8d8d';

const highscoreLifetimeName = 'LifetimeHighScore';
const highscoreLifetimeDefault = 150;

const tetromaniaTextStyle = {
    fontFamily: 'aesymatt',
    color: '#FFF',
    align: 'center',
}

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
function snapCardinalAngleDegrees(degrees) {
    return mod(Math.round(degrees / degreesQuarter) * degreesQuarter, degreesFull);
}

/** Gets cardinal angle from object, returning 0, PI/2, PI, or 3PI/2 */
function snapCardinalAngleRadians(radians) {
    return mod(Math.round(radians / radiansQuarter) * radiansQuarter, radiansFull);
}

/** Determines if the tetromino is elible to connect with ship */
function angleAcceptable(body) {
    if (!body) return 0;
    const radiansInsideQuarter = mod(body.angle + radiansEigth, radiansQuarter) - radiansEigth;
    return Math.abs(radiansInsideQuarter) <= radiansThirtySecond;
}

/** Remove element from array: https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript */
function removeArrayElement(list, element) {
    const index = list.indexOf(element);
    if (index >= 0) {
        return list.splice(index, 1)[0];
    }
}

function removeIf(list, predicate) {
    const index = list.findIndex(predicate);
    if (index >= 0) {
        return list.splice(index, 1)[0];
    }
}

/**
 * Gets scene-space XY position for given UV coordinate in given sprite's texture space.
 * Useful for calculating relative positioning between rotatable bodies.
 */
function getSpriteXYFromLerpUV(gameObject, lerpU = 0, lerpV = 0) {
    const center = new Phaser.Math.Vector2(
        gameObject.body.centerOfMass.x,
        gameObject.body.centerOfMass.y
    );

    const angleRadians = gameObject.angle * degreesToRadians;

    switch (snapCardinalAngleDegrees(gameObject.angle)) {
        case 90:
            lerpU = lerpV;
            lerpV = 1 - lerpU;
            break;
        case 180:
            lerpU = 1 - lerpU;
            lerpV = 1 - lerpV;
            break;
        case 270:
            lerpU = 1 - lerpV;
            lerpV = 1 - lerpU;
            break;
    }

    center.subtract({x: lerpU, y: lerpV})
        .multiply({x: gameObject.width, y: gameObject.height})
        .rotate(angleRadians);

    return new Phaser.Math.Vector2(
        gameObject.x - center.x,
        gameObject.y - center.y
    );
}

function getCoordinatesOfMassCenter(gameObject) {
    return getSpriteXYFromLerpUV(
        gameObject,
        gameObject.body.centerOffset.x,
        gameObject.body.centerOffset.y
    );
}

/**
 * Extract units of a tetromino body. Registers a point for every center of 32-wide units in the body.
 * Returns a list of grid-cell center positions, all located in scene space.
 * */
function getBlockLattice(tetromino, gridX = 0, gridY = 0) {
    // Get angle
    const angle = mod(tetromino.angle + degreesEigth, degreesQuarter) - degreesEigth;
    const switchAxis = Math.round(snapCardinalAngleDegrees(tetromino.angle) / 90) % 2 == 1;

    // Construct rotation matrix
    const mat2 = Matrix2.rotationMatrix(angle * degreesToRadians);

    // Tetromino's sprite dimensions
    const tetrominoWidth = switchAxis ? tetromino.height : tetromino.width;
    const tetrominoHeight = switchAxis ? tetromino.width : tetromino.height;

    // Tetromino's tile width and height
    const tileWidth = Math.round(tetrominoWidth / tetrominoUnitSize);
    const tileHeight = Math.round(tetrominoHeight / tetrominoUnitSize);

    // Scene position of the sprite's top-left corner
    const { x: offsetFromPivotToTopLeftX, y: offsetFromPivotToTopLeftY } = getSpriteXYFromLerpUV(tetromino, 0, 0);

    // "Crawl" for scene positions of each block in the tetromino
    const positions = [];
    // Loop over entire lattice within sprite bounds
    for (let tileY = 0.5; tileY < tileHeight; tileY++) {
        for (let tileX = 0.5; tileX < tileWidth; tileX++) {
            const unitX = tileX + gridX;
            const unitY = tileY + gridY;
            const rotatedX = mat2.multiplyVectorX(unitX, unitY) * tetrominoUnitSize + offsetFromPivotToTopLeftX;
            const rotatedY = mat2.multiplyVectorY(unitX, unitY) * tetrominoUnitSize + offsetFromPivotToTopLeftY;
            // Include only if lattice point actually contained inside physical body
            if (tetromino.scene.matter.containsPoint(tetromino.body, rotatedX, rotatedY)) {
                positions.push({ x: rotatedX, y: rotatedY, tileX: Math.round(unitX - 0.5), tileY: Math.round(unitY - 0.5) });
            }
        }
    }

    return positions;
}

/**
 * Grid placement information to snap tetromino into
 */
function getContainerGridCoords(shipContainer, tetromino) {

    const degreesSnapped = snapCardinalAngleDegrees(tetromino.angle);

    const offset = getSpriteXYFromLerpUV(tetromino, 0, 0).subtract(getSpriteXYFromLerpUV(shipContainer, 0, 0)).scale(1.0 / tetrominoUnitSize);

    roundVector(offset);

    return {
        x: offset.x,
        y: offset.y,
        rotationDegrees: snapCardinalAngleDegrees(degreesSnapped) // Snapped to 0, 90, 180, or 270
    };
}

/** Snaps tetromino to the ship-container grid */
function snapToContainerGrid(unitPlacement, scenePosGridOrigin, tetromino) {
    tetromino.angle = unitPlacement.rotationDegrees;
    // copy grid placement data to use as vector in positioning the tetromino
    const offset = new Phaser.Math.Vector2(unitPlacement).scale(tetrominoUnitSize);
    // console.log('offset 1', offset);
    offset.add(scenePosGridOrigin);
    // console.log('offset 2', offset);
    const angleRadians = unitPlacement.rotationDegrees * degreesToRadians;

    const shift = new Phaser.Math.Vector2(tetromino.body.centerOffset).rotate(angleRadians)

    const tetrominoWidth = tetromino.width;
    const tetrominoHeight = tetromino.height;

    switch(unitPlacement.rotationDegrees) {
        case 90:
            shift.x += tetrominoHeight;
            break;
        case 180:
            shift.x += tetrominoWidth;
            shift.y += tetrominoHeight;
            break;
        case 270:
            shift.y += tetrominoWidth;
            break;
    }

    offset.add(shift);
    // console.log('offset 3', offset);

    tetromino.x = offset.x;
    tetromino.body.position.x = offset.x;
    tetromino.body.positionPrev.x = offset.x;

    tetromino.y = offset.y;
    tetromino.body.position.y = offset.y;
    tetromino.body.positionPrev.y = offset.y;
}

function roundVector(vector2) {
    vector2.x = Math.round(vector2.x);
    vector2.y = Math.round(vector2.y);
}

/**
 * Choose random point within range, with uniform distribution
 * Source: https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly/50746409#50746409
 * Modified to set custom bounds
 * 
 * Testing strings:
 *     Math.min(...Array.from({length:1000}).map(() => randomInRange(1, 2).length())); // Should approximate very close to being 1
 *     Math.max(...Array.from({length:1000}).map(() => randomInRange(1, 2).length())); // Should approximate very close to being 2
 */
function randomInRange(minRadius, maxRadius) {
    const minFrac = Math.pow(minRadius / maxRadius, 2);
    const radius = Math.sqrt(Phaser.Math.RND.realInRange(minFrac, 1)) * maxRadius;
    return new Phaser.Math.Vector2(radius, 0).rotate(Phaser.Math.RND.frac() * radiansFull);
}

function randomRangeAroundCenter(minRadius, maxRadius, center) {
    return randomInRange(minRadius, maxRadius).add(center);
}

/**
 * Inverted lerp in respect to min-max bounds.
 * 
 * inverseLerp(3.0, 2.0, 4.0) = 0.5
 * inverseLerp(0.5, -1.0, 1.0) = 0.75
 * inverseLerp(10.0, 0.0, 100.0) = 0.1
 * 
 * Copied from https://stackoverflow.com/a/39776893
 */
function inverseLerp(val, min, max) {
    return (val - min) / (max - min);
}

function getTimeHighScore() {
    return localStorage.getItem(highscoreLifetimeName) ?? highscoreLifetimeDefault;
}

function setTimeHighScore(score) {
    return localStorage.setItem(highscoreLifetimeName, score);
}

function huetoHexCode(h) {
  const colorHex = huetoRGBInteger(h).toString(16).padStart(6, '0');
  return `#${colorHex}`;
}

// Yoinked and simplified from https://stackoverflow.com/a/17243070
function huetoRGBInteger(h) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const q = 1 - f;

  var red, green, blue;
  switch (i % 6) {
    case 0: red = 1, green = f, blue = 0; break;
    case 1: red = q, green = 1, blue = 0; break;
    case 2: red = 0, green = 1, blue = f; break;
    case 3: red = 0, green = q, blue = 1; break;
    case 4: red = f, green = 0, blue = 1; break;
    case 5: red = 1, green = 0, blue = q; break;
  }

  return (Math.round(red * 255) << 16) | (Math.round(green * 255) << 8) | (Math.round(blue * 255));
}
