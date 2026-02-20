class Orbit extends Phaser.Scene {
    constructor() {
        super('orbitScene');

        this.boundsExtraSpace = Math.min(gameWidth, gameHeight) * 5;
        this.wrapBounds = {
            min: {
                x: -this.boundsExtraSpace,
                y: -this.boundsExtraSpace
            },
            max: {
                x: gameWidth +  this.boundsExtraSpace,
                y: gameHeight + this.boundsExtraSpace
            }
        };
    }

    create() {
        this.floatingObjectLimit = 512;
        this.floatingObjectLimitSqrt = Math.sqrt(this.floatingObjectLimit);
        this.floatingObjects = [];

        this.matter.world.disableGravity();

        this.createNUILayer();

        this.createPlayerShip();
        this.createFloatingObjects();
        this.createEmitters();
    }

    createPlayerShip() {
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.playerShip = new ShipContainer(this, gameWidth * 0.5, gameHeight * 0.7, technologyCollisions['thruster']);
        this.playerShip.isShip = true;

        this.matter.world.on(Phaser.Physics.Matter.Events.COLLISION_START, event => {
            event.pairs.forEach(p => this.checkPairStartedCollision(p, p.bodyA, p.bodyB));
        }, this);

        // COLLISION_START causes horrible inaccuracies in building ship grid
        this.matter.world.on(Phaser.Physics.Matter.Events.COLLISION_ACTIVE, event => {
            event.pairs.forEach(p => this.checkPairActiveCollision(p, p.bodyA, p.bodyB));
        }, this);
    }

    checkPairStartedCollision(collision, bodyA, bodyB) {
        const gameObjectA = bodyA.gameObject;
        const gameObjectB = bodyB.gameObject;

        if (!(gameObjectA && gameObjectB) || (gameObjectA.isShip == gameObjectB.isShip)) {
            // world bounds has no gameObject, or ship vs ship, or floater vs floater
            return;
        }

        if (gameObjectA.isShip && gameObjectB.astroid) {
            gameObjectA.shipStartedColliding(gameObjectB)
        } else if (gameObjectB.isShip && gameObjectA.astroid) {
            gameObjectB.shipStartedColliding(gameObjectA)
        }
    }

    checkPairActiveCollision(collision, bodyA, bodyB) {
        const gameObjectA = bodyA.gameObject;
        const gameObjectB = bodyB.gameObject;
        
        if (!(gameObjectA && gameObjectB) || (gameObjectA.isShip && gameObjectB.isShip)) {
            // world bounds has no gameObject, or ship vs ship collision
            return;
        }

        collision.contacts.map(contact => contact.vertex).filter(c => c != null).forEach(({x, y}) => {
            this.debrisEmitter.emitParticleAt(x, y, 1);
        });

        if (gameObjectA.isShip && gameObjectB.tetromino) {
            if (gameObjectA.shipCollidingWith(gameObjectB)) {
                if (!removeArrayElement(this.floatingObjects, gameObjectB)) {
                    //console.log('gameObjectB not removed', gameObjectB);
                }
                this.mouseHoldConstraint.stopDrag();
            }
        } else if (gameObjectB.isShip && gameObjectA.tetromino) {
            if (gameObjectB.shipCollidingWith(gameObjectA)) {
                if (!removeArrayElement(this.floatingObjects, gameObjectA)) {
                    //console.log('gameObjectB not removed', gameObjectA);
                }
                this.mouseHoldConstraint.stopDrag();
            }
        }
    }

    createFloatingObjects() { 
        this.tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const limitInv = 1.0 / this.floatingObjectLimitSqrt;

        const encounterFactories = [ this.createSmallAsteroid, this.createTetromino, this.createMediumAsteroid ];

        const runRemove = obj => removeArrayElement(this.floatingObjects, obj);

        for (let yLerp = 0; yLerp < 1; yLerp += limitInv) {
            const worldY = Phaser.Math.Linear(this.wrapBounds.min.y, this.wrapBounds.max.y, yLerp);
            for (let xLerp = 0; xLerp < 1; xLerp += limitInv) {
                const worldX = Phaser.Math.Linear(this.wrapBounds.min.x, this.wrapBounds.max.x, xLerp);

                const placeCoord = new Phaser.Math.Vector2(128, 0).rotate(Phaser.Math.RND.rotation()).add({ x: worldX, y: worldY});

                const createEncounter = Phaser.Math.RND.weightedPick(encounterFactories);
                const generatedObject = createEncounter(placeCoord, this);

                if (!generatedObject) {
                    continue;
                }

                this.floatingObjects.push(generatedObject);
                generatedObject.body.frictionAir = 0;
                generatedObject.body.frictionStatic = 0;
                generatedObject.body.slop = 0.0125;
                generatedObject.on(Phaser.GameObjects.Events.DESTROY, runRemove);
            }
        }
    }

    createTetromino(placeCoord, scene) {
        if (placeCoord.distance(scene.playerShip) <= 384) {
            return; // Skip to next loop interation instead of placing piece at this lerp pos
        }

        const tetrominoName = Phaser.Math.RND.pick(tetrominoNames);

        const tetromino = scene.matter.add.sprite(placeCoord.x, placeCoord.y, tetrominoName, 0, {
            shape: scene.tetrominoCollisions[tetrominoName],
            wrapBounds: scene.wrapBounds
        }).setDepth(10).setAngle(snapCardinalAngleDegrees(Phaser.Math.RND.angle()));

        tetromino.astroid = false; // Signal to checkPairStartedCollision
        tetromino.tetromino = true; // Signal to checkPairActiveCollision

        return tetromino;
    }

    createSmallAsteroid(placeCoord, scene) {
        if (placeCoord.distance(scene.playerShip) <= 512) {
            return; // Skip to next loop interation instead of placing piece at this lerp pos
        }

        const smallAsteroid = scene.matter.add.sprite(placeCoord.x, placeCoord.y, 'asteroid_small', Phaser.Math.RND.integerInRange(0, 15));

        smallAsteroid
            .setOrigin(0.5)
            .setDepth(20)
            .setAngle(Phaser.Math.RND.angle()) // Random initital angle
            .setCircle(22); // Radius of circle body

        smallAsteroid.astroid = true; // Signal to checkPairStartedCollision
        smallAsteroid.tetromino = false; // Signal to checkPairActiveCollision

        smallAsteroid.body.angle += Phaser.Math.RND.realInRange(-0.025, 0.025); // Random angular movement
        smallAsteroid.body.wrapBounds = scene.wrapBounds;

        return smallAsteroid;
    }

    createMediumAsteroid(placeCoord, scene) {
        if (placeCoord.distance(scene.playerShip) <= 1024) {
            return; // Skip to next loop interation instead of placing piece at this lerp pos
        }

        const mediumAsteroid = scene.matter.add.sprite(placeCoord.x, placeCoord.y, 'asteroid_medium', Phaser.Math.RND.integerInRange(0, 15));

        mediumAsteroid
            .setOrigin(0.5)
            .setDepth(21)
            .setAngle(Phaser.Math.RND.angle()) // Random initital angle
            .setCircle(75); // Radius of circle body

        mediumAsteroid.astroid = true; // Signal to checkPairStartedCollision
        mediumAsteroid.tetromino = false; // Signal to checkPairActiveCollision

        mediumAsteroid.body.angle += Phaser.Math.RND.realInRange(-0.0125, 0.0125); // Random angular movement
        mediumAsteroid.body.wrapBounds = scene.wrapBounds;

        return mediumAsteroid;
    }

    createNUILayer() {
        // Allow mouse to pick up and drag objects (if this.allowDragObjects is true)
        this.mouseHoldConstraint = this.allowDragObjects ? this.matter.add.pointerConstraint() : { stopDrag: () => {} };

        this.scene.launch('navInterfaceScene');
        this.controlUi = this.game.scene.getScene('navInterfaceScene');
    }

    createEmitters() {
        const animatedParticles = ['debris', 'explosion', 'fire'].map((name, pfxIndex) => 
            this.add.particles(0, 0, name, {
                anim: [0, 1, 2, 3].map(index => `${name}-${index}`),
                lifespan: { min: 50, max: 150 },
                speed: { min: 10, max: 100 },
                scale: { min: 0.5, max: 2 },
                rotate: { start: 0, end: 90 },
                emitting: false,
                particleBringToTop: false
            }).setDepth(100 + pfxIndex)
        );
        this.debrisEmitter = animatedParticles[0];
        this.explosionEmitter = animatedParticles[1];
        this.fireEmitter = animatedParticles[2];

        // Tetromino emitters
        this.emitters = shapeNames.map((name, index) => {
            const emitter = this.add.particles(0, 0, `tetromino-${name}`, {
                lifespan: 25,
                speed: 0,
                scale: 0.25,
                color: [ 0xFF_FF_FF, 0 ],
                emitting: false,
            });
            emitter.setDepth(110 + index);

            const fieldName = `emitter${name.toUpperCase()}`;
            this[fieldName] = emitter;
            this.playerShip[fieldName] = emitter;
            return emitter;
        });
        this.playerShip.emitters = this.emitters;
    }
    
    update(_time, deltaMillis) {
        const deltaSeconds = deltaMillis * 0.001;
        const speed = 4 * deltaSeconds;

        this.playerShip.update();

        const motionDelta = this.controlUi.getControlDelta();

        const deltaX = -motionDelta.controlDX * speed;
        const deltaY = -motionDelta.controlDY * speed;

        this.floatingObjects.forEach(gameObject => {
            if (!this.playerShip.isAttached(gameObject)) {
                gameObject.setVelocity(deltaX, deltaY);
            }
        });
    }
}