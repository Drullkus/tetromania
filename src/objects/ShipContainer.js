class ShipContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, thrusterShape) {
        x = Math.round(x);
        y = Math.round(y);

        super(scene, x, y, []);

        // this.drawPartsTextureName = 'shipContainerTexture';
        // this.drawPartsTexture = scene.textures.addDynamicTexture(this.drawPartsTextureName, gameWidth, gameHeight);
        // this.drawPartsSprite = scene.add.sprite(0, 0, this.drawPartsTextureName).setOrigin(0);

        // console.groupCollapsed('construct ShipContainer');
        // console.log(thrusterShape);

        scene.add.existing(this);
        this.physicsObj = scene.matter.add.gameObject(this);
        this.shipParts = [];
        this.shipGrid = [];

        this.setSize(64, 96);
        this.body.centerOffset = { x: 0, y: 0 };
        this.body.centerOfMass = { x: 0.5, y: 0.5 };

        this.attachPart(scene.matter.add.sprite(x, y, 'thruster', 0, { shape: thrusterShape }));
        // this.add(this.drawPartsSprite);

        // console.groupEnd('construct ShipContainer');

        // Set again because adding the first piece will cause center to shift
        this.x = x;
        this.y = y;
        this.reorient();
    }

    attachPart(gameObject) {
        this.reorient();

        // console.log('pre-integratePart x, y', this.x, this.y);
        // console.log('pre-integratePart centerOffset', this.body.centerOffset);
        // console.log('pre-integratePart centerOfMass', this.body.centerOfMass);
        // console.log('pre-integratePart width, height', this.width, this.height);

        const unitPlacement = getContainerGridCoords(this, gameObject);

        if (!this.canAttach(gameObject, unitPlacement)) {
            // console.log('No attachment for gameObject at unitPlacement', gameObject, unitPlacement)
            return false;
        }
        // console.log('Attached gameObject at unitPlacement', gameObject, unitPlacement)

        // this.drawPartsTexture.drawFrame(gameObject.texture.key, null, gameObject.x + gameWidth * 0.5, gameObject.y + gameHeight * 0.5);

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

        const tetrominoParts = this.shipParts.flatMap(part => part.object.body.parts);
        // const tetrominoParts = this.shipParts.flatMap(part => part.object.body.parts.filter(part => !part.label));

        // FIXME Why is this incompatible with convex shapes in tetrominos? Coorelates with parts that do have label present
        const compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: tetrominoParts
        });
        // this.add(gameObject);

        this.setExistingBody(compoundBody, true);

        const {x: width, y: height} = new Phaser.Math.Vector2(compoundBody.bounds.max).subtract(compoundBody.bounds.min);
        this.setSize(width, height);
        
        this.body.centerOffset = new Phaser.Math.Vector2(width, height).multiply(this.body.centerOfMass); // Update centerOffset so that it's not in worldspace

        this.reorient();
        this.rebuildGrid();

        // console.log('post-integratePart x, y', this.x, this.y);
        // console.log('post-integratePart centerOffset', this.body.centerOffset);
        // console.log('post-integratePart centerOfMass', this.body.centerOfMass);
        // console.log('post-integratePart width, height', this.width, this.height);

        return true;
    }

    reorient() {
        roundVector(this);
        this.angle = 0;
        this.body.position.x = this.x;
        this.body.position.y = this.y;
        this.body.positionPrev.x = this.x;
        this.body.positionPrev.y = this.y;
    }

    update() {
        this.reorient();

        // this.emitterI.emitParticleAt(this.x, this.y, 1);

        // const minBoundLerp = getSpriteXYFromLerpUV(this, 0, 0);
        // this.emitterL.emitParticleAt(minBoundLerp.x, minBoundLerp.y, 1);

        // const maxBoundLerp = getSpriteXYFromLerpUV(this, 1, 1);
        // this.emitterJ.emitParticleAt(maxBoundLerp.x, maxBoundLerp.y, 1);


        // const pipeline = this.scene.renderer.pipelines.MULTI_PIPELINE;

        // const transform = new Phaser.GameObjects.Components.TransformMatrix();
        // const origin = getSpriteXYFromLerpUV(this);
        // transform.translate(origin.x, origin.y);

        this.shipParts.forEach(({ object, tileX, tileY, rotationDegrees }) => {
            // Important or else the sprites will not rotate
            const rotationRadians = degreesToRadians * (this.angle + rotationDegrees);
            object.body.angle = rotationRadians;

            // getBlockLattice(object).forEach(({ x, y, tileX: gridX, tileY: gridY }) => {
            //     const shift = 8;
            //     this.emitters[mod(gridX + tileX, 7)].emitParticleAt(x - shift, y, 1);
            //     this.emitters[mod(gridY + tileY, 7)].emitParticleAt(x + shift, y, 1);
            //     this.emitterO.emitParticleAt((gridX + tileX + 0.5) * 17, (gridY + tileY + 0.5) * 17, 1);
            // });

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

        // this.shipGrid.forEach(({tileX, tileY}) => {
        //     const shift = 10;
        //     const putX = (tileX + 0.5) * tetrominoUnitSize * 2;
        //     const putY = (tileY + 0.5) * tetrominoUnitSize * 2;
        //     this.emitters[mod(tileX, 7)].emitParticleAt(putX - shift, putY, 1);
        //     this.emitters[mod(tileY, 7)].emitParticleAt(putX + shift, putY, 1);
        // });
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
        
        // if (hasOverlap) {
        //     console.groupCollapsed('canAttach detected overlap');
        //     console.log('unitPlacement', unitPlacement);
        //     console.log('shipLattice', shipLattice);
        //     console.log('partLattice', partLattice);
        //     console.groupEnd('canAttach detected overlap');
        // }
        
        // Check for adjacent connections
        const doAttach = hasOverlap ? false : shipLattice.some(gridPoint => partLattice.some(unitPoint => {
            const north = gridPoint.x == unitPoint.x && gridPoint.y == unitPoint.y + 1;
            const east = gridPoint.x == unitPoint.x - 1 && gridPoint.y == unitPoint.y;
            const south = gridPoint.x == unitPoint.x && gridPoint.y == unitPoint.y - 1;
            const west = gridPoint.x == unitPoint.x + 1 && gridPoint.y == unitPoint.y;

            const pass = north || east || south || west;

            //if (pass) console.log(`${north} || ${east} || ${south} || ${west} = ${pass}, gridPoint, unitPoint`, gridPoint, unitPoint);

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
}
