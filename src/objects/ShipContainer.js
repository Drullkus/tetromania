class ShipContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, thrusterShape) {
        x = Math.round(x);
        y = Math.round(y);

        super(scene, x, y, []);

        console.groupCollapsed('construct ShipContainer');
        // console.log(thrusterShape);

        scene.add.existing(this);
        this.physicsObj = scene.matter.add.gameObject(this);
        this.shipParts = [];

        this.setSize(64, 96);
        this.body.centerOffset = { x: 0, y: 0 };
        this.body.centerOfMass = { x: 0.5, y: 0.5 };

        this.attachPart(scene.matter.add.sprite(0, 0, 'thruster', 0, { shape: thrusterShape }));

        console.groupEnd('construct ShipContainer');

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
            console.log('No attachment for gameObject at unitPlacement', gameObject, unitPlacement)
            return false;
        }
        console.log('Attached gameObject at unitPlacement', gameObject, unitPlacement)

        gameObject.onShip = true;
        snapToContainerGrid(unitPlacement, new Phaser.Math.Vector2(this).subtract(this.body.centerOffset), gameObject);
        gameObject.body.velocity = { x: 0, y: 0 };

        this.shipParts.push({
            object: gameObject,
            gridX: unitPlacement.x,
            gridY: unitPlacement.y,
            rotationDegrees: unitPlacement.rotationDegrees
        });

        this.scene.matter.world.remove(gameObject);

        // gameObject.removeFromDisplayList();
        // gameObject.removeFromUpdateList();

        const tetrominoParts = this.shipParts.flatMap(part => part.object.body.parts);
        // const tetrominoParts = this.shipParts.flatMap(part => part.object.body.parts.filter(part => !part.label));

        // FIXME Why is this incompatible with convex shapes in tetrominos?
        const compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: tetrominoParts
        });
        // this.add(gameObject);

        this.setExistingBody(compoundBody, true);

        const {x: width, y: height} = new Phaser.Math.Vector2(compoundBody.bounds.max).subtract(compoundBody.bounds.min);
        this.setSize(width, height);
        
        this.body.centerOffset = new Phaser.Math.Vector2(width, height).multiply(this.body.centerOfMass); // Update centerOffset so that it's not in worldspace

        this.reorient();

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

        this.generateShipLattice().forEach(({ x, y, tileX, tileY }) => {
            const shift = 8;
            this.emitters[mod(tileX, 7)].emitParticleAt(x - shift, y, 1);
            this.emitters[mod(tileY, 7)].emitParticleAt(x + shift, y, 1);
            this.emitterO.emitParticleAt((tileX + 0.5) * 17, (tileY + 0.5) * 17, 1);
        });

        // const minBoundLerp = getSpriteXYFromLerpUV(this, 0, 0);
        // this.emitterL.emitParticleAt(minBoundLerp.x, minBoundLerp.y, 1);

        // const maxBoundLerp = getSpriteXYFromLerpUV(this, 1, 1);
        // this.emitterJ.emitParticleAt(maxBoundLerp.x, maxBoundLerp.y, 1);

        // Important or else the sprites will not rotate
        this.shipParts.forEach(part => part.object.body.angle = degreesToRadians * (this.angle + part.rotationDegrees));
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
        const shipLattice = this.generateShipLattice().map(p => ({ x: p.tileX, y: p.tileY }));
        const partLattice = getBlockLattice(gameObject, unitPlacement.tileX, unitPlacement.tileY).map(p => ({ x: p.tileX + unitPlacement.x, y: p.tileY + unitPlacement.y }));

        const hasOverlap = shipLattice.some(gridPoint => partLattice.some(unitPoint => gridPoint.x == unitPoint.x && gridPoint.y == unitPoint.y));
        
        if (hasOverlap) {
            console.groupCollapsed('canAttach detected overlap');
            console.log('unitPlacement', unitPlacement);
            console.log('shipLattice', shipLattice);
            console.log('partLattice', partLattice);
            console.groupEnd('canAttach detected overlap');
        }
        
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

    generateShipLattice() {
        // FIXME get units from each tetromino instead
        return getBlockLattice(this);
    }
}
