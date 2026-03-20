// http://127.0.0.1:5500/?mode=orbitScene
// https://drullkus.github.io/tetromania/?mode=orbitScene
class Orbit extends Phaser.Scene {
    constructor() {
        super('orbitScene');
    }

    create({ musicTrack }) {
        this.boundsExtraSpace = Math.min(gameWidth, gameHeight) * 5;
        this.wrapBounds = {
            min: {
                x: -this.boundsExtraSpace,
                y: -this.boundsExtraSpace
            },
            max: {
                x: gameWidth + this.boundsExtraSpace,
                y: gameHeight + this.boundsExtraSpace
            }
        };

        if (!this.musicTrack) {
            this.musicTrack = musicTrack;
        }

        this.floatingObjectLimit = 256;
        this.floatingObjectLimitSqrt = Math.sqrt(this.floatingObjectLimit);
        this.floatingObjects = [];

        this.matter.world.disableGravity();

        this.createSpaceBackgroundLayer();
        this.createNavLayer();
        this.createTimeLayer();
        this.gameOverLayer = null;

        this.createPlayerShip();
        this.createFloatingObjects();
        this.createEmitters();

        this.ambientSpeed = new Phaser.Math.Vector2(0.0, 100.0);
        this.ambientAcceleration = new Phaser.Math.Vector2(0.0, 10.0);

        this.asteroidHitSound = this.sound.add('asteroid_thump');
        this.fuseSound = this.sound.add('fuse');
        this.rocketSound = this.sound.add('rocket');
        this.tetrominoHitSound = this.sound.add('tetromino_hit');
    }

    createPlayerShip() {
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.playerShip = new ShipContainer(this, controlFocusX, controlFocusY, technologyCollisions['thruster']);
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

        if (gameObjectA.asteroid == true || gameObjectB.asteroid == true) {
            this.playAsteroidHitSound();
        }

        if (gameObjectA.isShip && gameObjectB.asteroid) {
            gameObjectA.startedCollidingAsteroid(gameObjectB);
            const removed = gameObjectA.bodyPartHit(bodyA, gameObjectB, collision);
            if (removed) {
                this.floatingObjects.push(removed);
            }
        } else if (gameObjectB.isShip && gameObjectA.asteroid) {
            gameObjectB.startedCollidingAsteroid(gameObjectA);
            const removed = gameObjectB.bodyPartHit(bodyB, gameObjectA, collision);
            if (removed) {
                this.floatingObjects.push(removed);
            }
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
            if (gameObjectA.shipConnectedWith(gameObjectB)) {
                if (removeArrayElement(this.floatingObjects, gameObjectB)) {
                    this.playFuseSound();
                }
                this.mouseHoldConstraint.stopDrag();
            } else {
                this.playTetrominoHitSound();
            }
        } else if (gameObjectB.isShip && gameObjectA.tetromino) {
            if (gameObjectB.shipConnectedWith(gameObjectA)) {
                if (removeArrayElement(this.floatingObjects, gameObjectA)) {
                    this.playFuseSound();
                }
                this.mouseHoldConstraint.stopDrag();
            } else {
                this.playTetrominoHitSound();
            }
        }
    }

    playAsteroidHitSound() {
        this.asteroidHitSound.volume = Phaser.Math.RND.realInRange(0.8, 2.0);
        this.asteroidHitSound.play();
    }

    playFuseSound() {
        this.fuseSound.volume = Phaser.Math.RND.realInRange(0.4, 0.8);
        this.fuseSound.play();
    }

    playTetrominoHitSound() {
        this.tetrominoHitSound.volume = Phaser.Math.RND.realInRange(0.4, 0.8);
        this.tetrominoHitSound.play();
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
                generatedObject.on(Phaser.GameObjects.Events.DESTROY, runRemove, this);
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

        tetromino.asteroid = false; // Signal to checkPairStartedCollision
        tetromino.tetromino = true; // Signal to checkPairActiveCollision
        tetromino.broken = false;

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

        smallAsteroid.asteroid = true; // Signal to checkPairStartedCollision
        smallAsteroid.tetromino = false; // Signal to checkPairActiveCollision
        smallAsteroid.broken = false;

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

        mediumAsteroid.asteroid = true; // Signal to checkPairStartedCollision
        mediumAsteroid.tetromino = false; // Signal to checkPairActiveCollision
        mediumAsteroid.broken = false;

        mediumAsteroid.body.angle += Phaser.Math.RND.realInRange(-0.0125, 0.0125); // Random angular movement
        mediumAsteroid.body.wrapBounds = scene.wrapBounds;

        return mediumAsteroid;
    }

    createSpaceBackgroundLayer() {
        this.scene.launch('spaceBackgroundScene');
        this.spaceBackground = this.game.scene.getScene('spaceBackgroundScene');
    }

    createNavLayer() {
        // Allow mouse to pick up and drag objects (if this.allowDragObjects is true)
        this.mouseHoldConstraint = this.allowDragObjects ? this.matter.add.pointerConstraint() : { stopDrag: () => {} };

        this.cursorRange = 129;
        this.scene.launch('navInterfaceScene', { pullFactor: 0.05, dragCallback: () => {}, cursorRange: this.cursorRange });
        this.controlUi = this.game.scene.getScene('navInterfaceScene');
    }

    createTimeLayer() {
        this.scene.launch('gameTimeScene');
        this.gameTimeLayer = this.game.scene.getScene('gameTimeScene');
    }

    createGameOverLayer() {
        this.scene.launch('gameOverScene', { parentScene: this.sys.config, musicTrack: this.musicTrack });
        this.gameOverLayer = this.game.scene.getScene('gameOverScene');
    }

    createEmitters() {
        const animatedParticles = ['debris', 'fire'].map((name, pfxIndex) => 
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
        this.fireEmitter = animatedParticles[1];

        this.explosionEmitter = this.add.particles(0, 0, 'explosion', {
            anim: [0, 1, 2, 3].map(index => `explosion-${index}`),
            lifespan: { min: 100, max: 250 },
            speed: { min: 20, max: 0 },
            scale: { min: 4, max: 6 },
            rotate: { start: 0, end: 90 },
            emitting: false,
            particleBringToTop: false
        }).setDepth(102);

        this.playerShip.debrisEmitter = this.debrisEmitter;
        this.playerShip.explosionEmitter = this.explosionEmitter;
        this.playerShip.fireEmitter = this.fireEmitter;

        // Tetromino emitters
        this.emitters = shapeNames.map((name, index) => {
            const emitter = this.add.particles(0, 0, `tetromino-${name}`, {
                lifespan: 500,
                angle: { min: 45, max: 135 },
                speed: 100,
                scale: 0.125,
                emitting: false,
            });
            emitter.setDepth(index - 10);

            const fieldName = `emitter${name.toUpperCase()}`;
            this[fieldName] = emitter;
            this.playerShip[fieldName] = emitter;
            return emitter;
        });
        this.playerShip.emitters = this.emitters;
    }
    
    update(_time, deltaMillis) {
        this.updateMovement(deltaMillis);

        if (this.playerShip) {
            if (this.playerShip.body) {
                const tetrominoEmitter = this.emitters[Phaser.Math.RND.integerInRange(0, this.emitters.length - 1)];
                const { controlDX: x, controlDY: y } = this.gameOverLayer || !this.controlUi ? { controlDX: 0, controlDY: 0 } : this.controlUi.getControlDelta();
                tetrominoEmitter.speed = Math.sqrt(this.ambientSpeed.clone().lerp({ x: x, y: Math.min(y, 0)}, 0.6).length()) * 5.0;
                tetrominoEmitter.emitParticleAt(this.playerShip.seedObj.x, this.playerShip.seedObj.y + this.playerShip.seedObj.height * 0.33);
            }

            this.playerShip.update();
        }

        if (!this.gameOverLayer) {
            this.checkBrokenObjects();
            this.generateNewFloaters();
        }
    }

    updateMovement(deltaMillis) {
        const deltaSeconds = deltaMillis * 0.001;
        const speed = 1 * deltaSeconds;

        const motionDelta = this.gameOverLayer || !this.controlUi ? { controlDX: 0, controlDY: 0 } : this.controlUi.getControlDelta();
        const deltaX = 3 * (this.ambientSpeed.x - motionDelta.controlDX);
        const deltaY = 1.5 * (this.ambientSpeed.y - motionDelta.controlDY);

        this.floatingObjects.forEach(gameObject => {
            if (!this.playerShip.isAttached(gameObject)) {
                gameObject.setVelocity(deltaX * speed, deltaY * speed);
            }
        });

        this.spaceBackground.shiftLayers(deltaMillis, deltaX * speed * -0.015, deltaY * speed * -0.015);

        if (this.gameOverLayer) {
            // Halt "movement"
            this.ambientSpeed.scale(0.8);
        } else {
            // Slow yet maniacial increase in speed
            this.ambientSpeed.add(this.ambientAcceleration.clone().scale(speed));

            const ambientFactor = Math.min(1, this.ambientSpeed.length() / 500);
            const power = Math.min(1, Phaser.Math.Distance.Between(motionDelta.controlDX, motionDelta.controlDY, 0, 0) / this.cursorRange);
            if (power > 0.001 && !this.rocketSound.isPlaying && this.ambientSpeed.y > 0) {
                this.rocketSound.rate = Phaser.Math.Linear(2.0, 1.0, power);
                this.rocketSound.volume = Phaser.Math.Linear(0.0, 1.0, ambientFactor * power * power * power * Math.pow(Phaser.Math.RND.realInRange(0.5, 1.0), 2));
                this.rocketSound.detune = Phaser.Math.Linear(-1200, -1000, power);
                this.rocketSound.play();
            }
        }
    }

    shipBroke(shipObject) {
        if (shipObject == this.playerShip) {
            this.gameOver();
        }
    }

    gameOver() {
        if (this.gameOverLayer) {
            return;
        }

        this.playerShip.demolish();

        this.createGameOverLayer();
        this.controlUi.disableControl();
        this.gameTimeLayer.stopTime();

        this.tweens.add({
            targets: this.musicTrack,
            volume: 0,
            duration: 1000,
            repeat: 0,
            ease: 'cubic.inout'
        });
    }

    checkBrokenObjects() {
        for (let index = this.floatingObjects.length - 1; index >= 0; index--) {
            const floater = this.floatingObjects[index];

            if (floater.broken == true && this.isObjectCloseToBounds(floater)) {
                floater.broken = false;
                floater.tint = 0xFF_FF_FF;
                floater.setAngle(snapCardinalAngleDegrees(Phaser.Math.RND.angle()));
                floater.x = Phaser.Math.RND.realInRange(this.wrapBounds.min.x + 300, this.wrapBounds.max.x - 300);
            }
        }
    }

    isObjectCloseToBounds(gameObject) {
        const worldBounds = this.wrapBounds;
        const shrink = 500;

        if (gameObject.x < worldBounds.min.x + shrink || gameObject.x > worldBounds.max.x - shrink) {
            return true;
        }

        if (gameObject.y > worldBounds.max.y - shrink) {
            return true;
        }

        return false;
    }

    getTimeSinceStart() {
        // In Milliseconds
        return this.time.now - this.time.startTime;
    }

    generateNewFloaters() {
        const runRemove = obj => removeArrayElement(this.floatingObjects, obj);
        const secondsSinceStart = this.getTimeSinceStart() * 0.001;
        const encounterFactories = [ this.createSmallAsteroid, this.createTetromino, this.createMediumAsteroid ];

        // generate new floaters at top bounds, increasing limit over time
        while (this.floatingObjectLimit + secondsSinceStart > this.floatingObjects.length) {
            const placeCoord = new Phaser.Math.Vector2(128, 0).rotate(Phaser.Math.RND.rotation()).add({ x: Phaser.Math.RND.realInRange(this.wrapBounds.min.x + 300, this.wrapBounds.max.x - 300), y: this.wrapBounds.min.y + 300});

            const createEncounter = Phaser.Math.RND.weightedPick(encounterFactories);
            const generatedObject = createEncounter(placeCoord, this);

            if (!generatedObject) {
                continue;
            }

            this.floatingObjects.push(generatedObject);
            generatedObject.body.frictionAir = 0;
            generatedObject.body.frictionStatic = 0;
            generatedObject.body.slop = 0.0125;
            generatedObject.on(Phaser.GameObjects.Events.DESTROY, runRemove, this);
        }
    }
}