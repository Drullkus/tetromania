class ShipContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, thrusterShape) {
        super(scene, x, y, []);

        this.x = x;
        this.y = y;

        console.group('construct ShipContainer');

        scene.add.existing(this);
        this.physicsObj = scene.matter.add.gameObject(this);
        this.shipParts = [];

        this.setSize(64, 96);
        this.body.centerOffset = { x: 0, y: 0 };
        this.body.centerOfMass = { x: 0.5, y: 0.5 };

        this.integratePart(scene.matter.add.sprite(x, y, 'thruster', 0, { shape: thrusterShape}));

        console.groupEnd('construct ShipContainer');
    }

    integratePart(gameObject) {
        // console.log('pre-integratePart x, y', this.x, this.y);
        // console.log('pre-integratePart centerOffset', this.body.centerOffset);
        // console.log('pre-integratePart centerOfMass', this.body.centerOfMass);
        // console.log('pre-integratePart width, height', this.width, this.height);
        
        gameObject.onShip = true;

        const unitPlacement = snapToContainerGrid(this, gameObject);

        gameObject.angle = unitPlacement.rotationDegrees;

        // console.log('unitPlacement', unitPlacement);

        this.shipParts.push({
            object: gameObject,
            ...unitPlacement
        });

        this.scene.matter.world.remove(gameObject);

        const compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: this.shipParts.flatMap(part => part.object.body.parts)
        });

        this.setExistingBody(compoundBody, true);

        const {x: width, y: height} = new Phaser.Math.Vector2(compoundBody.bounds.max).subtract(compoundBody.bounds.min);
        this.setSize(width, height);
        
        this.body.centerOffset = new Phaser.Math.Vector2(width, height).scale(0.5); // Update centerOffset so that it's not in worldspace

        // console.log('post-integratePart x, y', this.x, this.y);
        // console.log('post-integratePart centerOffset', this.body.centerOffset);
        // console.log('post-integratePart centerOfMass', this.body.centerOfMass);
        // console.log('post-integratePart width, height', this.width, this.height);
    }

    update() {
        // Important or else the sprites will not rotate
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

         this.emitterJ.emitParticleAt(this.x, this.y, 1);

         getBlockLattice(this).forEach(({ x, y }) => {
             this.emitterS.emitParticleAt(x, y, 1);
         });

        const minBoundMass = getSpriteXYFromLerpUV(this, 0, 0);
        this.emitterL.emitParticleAt(minBoundMass.x, minBoundMass.y, 1);

        const maxBoundMass = getSpriteXYFromLerpUV(this, 1, 1);
        this.emitterO.emitParticleAt(maxBoundMass.x, maxBoundMass.y, 1);

        const maxBoundPixMass = getSpriteXYFromPixelOffset(this, this.width, this.height);
        this.emitterZ.emitParticleAt(maxBoundPixMass.x, maxBoundPixMass.y, 1);

        const spriteCoord = getSpriteXYFromPixelOffset(this, -tetrominoUnitSize, tetrominoUnitSize);
        this.emitterO.emitParticleAt(spriteCoord.x, spriteCoord.y, 1);

        this.shipParts.forEach(part => part.object.body.angle = degreesToRadians * (this.angle + part.rotationDegrees));
    }
}
