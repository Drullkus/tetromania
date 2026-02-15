class SpaceShip extends Phaser.GameObjects.Container {
    constructor(scene, x, y, children) {
        super(scene, y, x, []);

        scene.add.existing(this);
        this.physicsObj = scene.matter.add.gameObject(this);
        this.parts = [];

        const technologyCollisions = scene.cache.json.get('technology_collision');

        const thruster = scene.matter.add.sprite(x, y, 'thruster', 0, {
            shape: technologyCollisions['thruster']
        });
        thruster.onShip = true;

        this.setSize(thruster.width, thruster.height);

        this.integratePart(thruster);
    }

    integratePart(gameObject) {
        console.log('pre-integratePart centerOffset', this.body.centerOffset);
        console.log('pre-integratePart centerOfMass', this.body.centerOfMass);
        console.log('pre-integratePart width, height', this.width, this.height);
        
        gameObject.onShip = true;

        this.parts.push({
            object: gameObject,
            x: Math.round(this.x - gameObject.x), // offset
            y: Math.round(this.y - gameObject.y), // offset
            rotationDegrees: snapCardinalAngleDegrees(gameObject.angle)
        });

        this.scene.matter.world.remove(gameObject);

        const compoundBody = Phaser.Physics.Matter.Matter.Body.create({
            parts: this.parts.flatMap(part => part.object.body.parts)
        });

        this.setExistingBody(compoundBody, true);

        const {x: width, y: height} = new Phaser.Math.Vector2(compoundBody.bounds.max).subtract(compoundBody.bounds.min);
        this.setSize(width, height);
        
        this.body.centerOffset = new Phaser.Math.Vector2(width, height).scale(0.5); // Update so that it's not in worldspace

        console.log('post-integratePart centerOffset', this.body.centerOffset);
        console.log('post-integratePart centerOfMass', this.body.centerOfMass);
        console.log('post-integratePart width, height', this.width, this.height);
    }

    update() {
         this.emitterJ.emitParticleAt(this.x, this.y, 1);

         getBlockLattice(this).forEach(({ x, y }) => {
             this.emitterS.emitParticleAt(x, y, 1);
         });

        const minBoundMass = getSpritePosition(this, 0, 0);
        this.emitterL.emitParticleAt(minBoundMass.x, minBoundMass.y, 1);

        const maxBoundMass = getSpritePosition(this, 1, 1);
        this.emitterZ.emitParticleAt(maxBoundMass.x, maxBoundMass.y, 1);

        // Important or else the sprites will not rotate
        this.parts.forEach(part => part.object.body.angle = degreesToRadians * (this.angle + part.rotationDegrees));
    }
}
