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

        const boundDiff = new Phaser.Math.Vector2(compoundBody.bounds.max).subtract(compoundBody.bounds.min);
        this.setSize(boundDiff.x, boundDiff.y);
    }

    update() {
        getBlockLattice(this).forEach(({ x, y }) => {
            this.emitterJ.emitParticleAt(x, y, 1);
        });
    }
}
