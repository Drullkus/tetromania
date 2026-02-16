class ShipContainer extends Phaser.GameObjects.Container {
    constructor(scene, x, y, thrusterShape) {
        x = Math.round(x);
        y = Math.round(y);

        super(scene, x, y, []);

        console.groupCollapsed('construct ShipContainer');

        scene.add.existing(this);
        this.physicsObj = scene.matter.add.gameObject(this);
        this.shipParts = [];

        this.setSize(64, 96);
        this.body.centerOffset = { x: 0, y: 0 };
        this.body.centerOfMass = { x: 0.5, y: 0.5 };

        this.integratePart(scene.matter.add.sprite(x, y, 'thruster', 0, { shape: thrusterShape }));

        console.groupEnd('construct ShipContainer');

        // Set again because adding the first piece will cause center to shift
        this.x = x;
        this.y = y;
        this.reorient();
    }

    integratePart(gameObject) {
        this.reorient();

        // console.log('pre-integratePart x, y', this.x, this.y);
        // console.log('pre-integratePart centerOffset', this.body.centerOffset);
        // console.log('pre-integratePart centerOfMass', this.body.centerOfMass);
        // console.log('pre-integratePart width, height', this.width, this.height);
        
        gameObject.onShip = true;

        const unitPlacement = getContainerGridCoords(this, gameObject);
        snapToContainerGrid(unitPlacement, new Phaser.Math.Vector2(this).subtract(this.body.centerOffset), gameObject);
        gameObject.body.velocity = { x: 0, y: 0 };

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
        
        this.body.centerOffset = new Phaser.Math.Vector2(width, height).multiply(this.body.centerOfMass); // Update centerOffset so that it's not in worldspace

        this.reorient();

        // console.log('post-integratePart x, y', this.x, this.y);
        // console.log('post-integratePart centerOffset', this.body.centerOffset);
        // console.log('post-integratePart centerOfMass', this.body.centerOfMass);
        // console.log('post-integratePart width, height', this.width, this.height);
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

        // getBlockLattice(this).forEach(({ x, y }) => {
        //     this.emitterO.emitParticleAt(x, y, 1);
        // });

        // const minBoundLerp = getSpriteXYFromLerpUV(this, 0, 0);
        // this.emitterL.emitParticleAt(minBoundLerp.x, minBoundLerp.y, 1);

        // const maxBoundLerp = getSpriteXYFromLerpUV(this, 1, 1);
        // this.emitterJ.emitParticleAt(maxBoundLerp.x, maxBoundLerp.y, 1);

        // Important or else the sprites will not rotate
        this.shipParts.forEach(part => part.object.body.angle = degreesToRadians * (this.angle + part.rotationDegrees));
    }

    isAttached(gameObject) {
        return this.shipParts.map(p => p.object).indexOf(gameObject) > 0;
    }
}
