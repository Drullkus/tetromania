class ShipContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, thrusterShape) {
        x = Math.round(x);
        y = Math.round(y);

        super(scene, x, y, []);

        this.onShip = true;
        scene.add.existing(this);
        this.physicsObj = scene.matter.add.gameObject(this);
        this.shipParts = [];
        this.shipGrid = [];

        this.setSize(64, 96);
        this.body.centerOffset = { x: 0, y: 0 };
        this.body.centerOfMass = { x: 0.5, y: 0.5 };

        const thrusterObj = scene.matter.add.sprite(x, y, 'thruster', 0, { shape: thrusterShape });
        thrusterObj.thruster = true;
        this.attachPart(thrusterObj);
        // this.add(this.drawPartsSprite);

        // Set again because adding the first piece will cause center to shift
        this.x = x;
        this.y = y;
        this.reorient();
    }

    shipCollidingWith(tetromino) {
        if (angleAcceptable(tetromino.body) && !this.isAttached(tetromino)) {
            return this.attachPart(tetromino);
        }

        return false;
    }

    startedCollidingAsteroid(gameObject) {
        if (gameObject.asteroid != true) {
            return;
        } // Asteroids only!

        // gameObject.destroy(); // FIXME damage the ship instead and deflect the asteroid
    }

    bodyPartHit(shipBody, _hitByObject, _collision) {
        if (shipBody.originalBeforeShip) {
            return this.breakPart(shipBody.originalBeforeShip);
        }
    }

    attachPart(gameObject) {
        if (gameObject.isShip) {
            return false;
        }

        this.reorient();

        const unitPlacement = getContainerGridCoords(this, gameObject);

        if (!this.canAttach(gameObject, unitPlacement)) {
            return false;
        }

        // console.log(gameObject.body.parts);

        gameObject.body.parts.forEach(b => b.originalBeforeShip = gameObject);

        gameObject.onShip = true;
        snapToContainerGrid(unitPlacement, new Phaser.Math.Vector2(this).subtract(this.body.centerOffset), gameObject);
        gameObject.body.velocity = { x: 0, y: 0 };

        const shipPartData = {
            object: gameObject,
            tileX: unitPlacement.x,
            tileY: unitPlacement.y,
            rotationDegrees: unitPlacement.rotationDegrees
        };

        this.shipParts.push(shipPartData);

        this.scene.matter.world.remove(gameObject);

        // gameObject.removeFromDisplayList();
        // gameObject.removeFromUpdateList();

        this.rebuildBody();

        return true;
    }

    rebuildBody() {
        const tetrominoParts = this.shipParts.flatMap(part => part.object.body.parts);
        // const tetrominoParts = this.shipParts.flatMap(part => part.object.body.parts.filter(part => !part.label));

        // FIXME Why is this incompatible with convex shapes in tetrominos? Coorelates with parts that do have label present
        const compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: tetrominoParts
        });
        // this.add(gameObject);

        compoundBody.isStatic = true;
        this.setExistingBody(compoundBody, true);

        const {x: width, y: height} = new Phaser.Math.Vector2(compoundBody.bounds.max).subtract(compoundBody.bounds.min);
        this.setSize(width, height);
        
        this.body.centerOffset = new Phaser.Math.Vector2(width, height).multiply(this.body.centerOfMass); // Update centerOffset so that it's not in worldspace

        this.reorient();
        this.rebuildGrid();
    }

    reorient() {
        roundVector(this);
        this.angle = 0;
        this.body.position.x = this.x;
        this.body.position.y = this.y;
        this.body.positionPrev.x = this.x;
        this.body.positionPrev.y = this.y;
    }

    /** Remove a piece from this ship, mark it unable to connect, and float it away */
    breakPart(gameObject) {
        const removed = this.removePart(gameObject);

        removed.tetromino = false;
        removed.tint = 0x55_44_33; // The piece is toasted
        // TODO switch to destroyed sprite

        getBlockLattice(removed).forEach(({ x, y }) => {
            this.explosionEmitter.emitParticleAt(x, y, 1);
        });

        return removed;
    }

    removePart(gameObject, skipRebuild) {
        const extractedPart = removeIf(this.shipParts, part => part.object === gameObject);
        if (extractedPart && extractedPart.object) {
            const extractedObject = extractedPart.object;

            extractedObject.onShip = false;
            extractedObject.body.parts.forEach(b => {
                b.gameObject = gameObject;
                b.parent = extractedObject.body;
            });

            this.scene.matter.world.add(gameObject.body);

            if (skipRebuild) {
                this.rebuildBody();
            }

            extractedObject.body.positionPrev.x = extractedObject.body.position.x;
            extractedObject.body.positionPrev.y = extractedObject.body.position.y;

            if (extractedObject.thruster == true) {
                this.scene.shipBroke(this);
            }

            return extractedObject;
        }
    }

    update() {
        if (!this.body) {
            return; // Ship is gone
        }
        this.reorient();

        // const pipeline = this.scene.renderer.pipelines.MULTI_PIPELINE;

        // const transform = new Phaser.GameObjects.Components.TransformMatrix();
        // const origin = getSpriteXYFromLerpUV(this);
        // transform.translate(origin.x, origin.y);

        this.shipParts.forEach(({ object, tileX, tileY, rotationDegrees }) => {
            // Important or else the sprites will not rotate
            const rotationRadians = degreesToRadians * (this.angle + rotationDegrees);
            object.body.angle = rotationRadians;

            if (this.showGridUnitsOnShip) {
                getBlockLattice(object).forEach(({ x, y, tileX: gridX, tileY: gridY }) => {
                    const shift = 8;
                    this.emitters[mod(gridX + tileX, 7)].emitParticleAt(x - shift, y, 1);
                    this.emitters[mod(gridY + tileY, 7)].emitParticleAt(x + shift, y, 1);
                });
            }

            // const pieceTransform = new Phaser.GameObjects.Components.TransformMatrix().rotate(rotationRadians);
            // transform.multiply(pieceTransform, pieceTransform);
            // // pieceTransform.translate(tileX * tetrominoUnitSize, tileY * tetrominoUnitSize);
            // // FIXME this is live rendering to GPU
            // pipeline.batchTextureFrame(
            //     object.texture.get(),
            //     tileX * tetrominoUnitSize, tileY * tetrominoUnitSize,
            //     0xFF_FF_FF,
            //     1,
            //     pieceTransform
            // );
        });

        if (this.hudShowGridUnits) {
            this.shipGrid.forEach(({tileX, tileY}) => {
                const shift = 10;
                const putX = (tileX + 0.5) * tetrominoUnitSize * 2;
                const putY = (tileY + 0.5) * tetrominoUnitSize * 2;
                this.emitters[mod(tileX, 7)].emitParticleAt(putX - shift, putY, 1);
                this.emitters[mod(tileY, 7)].emitParticleAt(putX + shift, putY, 1);
            });
        }

        if (this.hudShowPieceCoords) {
            this.shipParts.forEach(({x, y}) => {
                this.emitters[0].emitParticleAt(x, y, 1);
            });
        }
    }

    isAttached(gameObject) {
        return this.shipParts.some(p => p.object == gameObject);
    }

    // Checks if the integer coord is ajacent on this ship's grid, barring diagonals or overlaps
    canAttach(gameObject, unitPlacement) {
        // Automatic pass if zero parts (as called during constructor)
        if (this.shipParts.length == 0) {
            return true;
        }

        // FIXME This will scan entire grid inside ship's boundaries against the tetromino grid
        //  Future optimization will have to minimize the search-space to the point of collision
        const shipLattice = this.shipGrid.map(p => ({ x: p.tileX, y: p.tileY }));
        const partLattice = getBlockLattice(gameObject, unitPlacement.tileX, unitPlacement.tileY).map(p => ({ x: p.tileX + unitPlacement.x, y: p.tileY + unitPlacement.y }));

        const hasOverlap = shipLattice.some(gridPoint => partLattice.some(unitPoint => gridPoint.x == unitPoint.x && gridPoint.y == unitPoint.y));

        // console.log(`shipLattice partLattice hasOverlap=${hasOverlap}`, shipLattice, partLattice);
        
        // Check for adjacent connections
        const doAttach = hasOverlap ? false : shipLattice.some(gridPoint => partLattice.some(unitPoint => {
            const north = gridPoint.x == unitPoint.x && gridPoint.y == unitPoint.y + 1;
            const east = gridPoint.x == unitPoint.x - 1 && gridPoint.y == unitPoint.y;
            const south = gridPoint.x == unitPoint.x && gridPoint.y == unitPoint.y - 1;
            const west = gridPoint.x == unitPoint.x + 1 && gridPoint.y == unitPoint.y;

            const pass = north || east || south || west;

            return pass;
        }));

        return doAttach;
    }

    rebuildGrid() {
        if (this.shipParts.length > 1) {
            this.shipParts = this.shipParts.map(part => {
                const unitReplacement = getContainerGridCoords(this, part.object);
                return {
                    object: part.object,
                    tileX: unitReplacement.x,
                    tileY: unitReplacement.y,
                    rotationDegrees: unitReplacement.rotationDegrees
                };
            });
        }

        this.shipGrid = this.shipParts.flatMap(({ object, tileX, tileY, rotationDegrees }) => {
            // Important or else the sprites will not rotate
            const rotationRadians = degreesToRadians * (this.angle + rotationDegrees);
            object.body.angle = rotationRadians;

            return getBlockLattice(object).map(({ tileX: gridX, tileY: gridY }) => ({
                tileX: gridX + tileX, tileY: gridY + tileY
            }));
        });
    }

    isEmpty() {
        return this.shipParts.length == 0;
    }

    breakAllParts() {
        for (let index = this.shipParts.length - 1; index >= 0; index--) {
            const part = this.shipParts[index];
            if (!part) {
                continue;
            }
            this.breakPart(part.object, true);
        }
    }

    demolish() {
        this.breakAllParts();
        this.destroy();
    }
}
