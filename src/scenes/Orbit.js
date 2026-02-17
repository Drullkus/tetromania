class Orbit extends Phaser.Scene {
    constructor() {
        super('orbitScene');

        this.boundsExtraSpace = 400;
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
        this.floatingObjectLimit = 200;
        this.floatingObjectLimitSqrt = Math.sqrt(this.floatingObjectLimit);
        this.floatingObjects = [];

        this.matter.world.disableGravity();

        this.createNUILayer();

        const tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.playerShip = new ShipContainer(this, this.controlUi.focusX, this.controlUi.focusY, technologyCollisions['thruster']);
        this.playerShip.isShip = true;

        const posClearOfDebris = { x: this.controlUi.focusX, y: this.controlUi.focusY };

        const limitInv = 1.0 / this.floatingObjectLimitSqrt;
        for (let yLerp = 0; yLerp < 1; yLerp += limitInv) {
            const worldY = Phaser.Math.Linear(this.wrapBounds.min.y, this.wrapBounds.max.y, yLerp);
            for (let xLerp = 0; xLerp < 1; xLerp += limitInv) {
                const worldX = Phaser.Math.Linear(this.wrapBounds.min.x, this.wrapBounds.max.x, xLerp);

                const placeCoord = new Phaser.Math.Vector2(32, 0).rotate(Phaser.Math.RND.rotation()).add({ x: worldX, y: worldY});

                if (placeCoord.distance(posClearOfDebris) < 150) {
                    continue; // Skip to next loop interation instead of placing piece at this lerp pos
                }

                const tetrominoName = Phaser.Math.RND.pick(tetrominoNames);

                const tetromino = this.matter.add.sprite(placeCoord.x, placeCoord.y, tetrominoName, 0, {
                    shape: tetrominoCollisions[tetrominoName],
                    wrapBounds: this.wrapBounds
                }).setAngle(snapCardinalAngleDegrees(Phaser.Math.RND.angle()));

                this.floatingObjects.push(tetromino);
            }
        }
        
        const _this = this;

        this.matter.world.on(Phaser.Physics.Matter.Events.COLLISION_ACTIVE, event => {
            event.pairs.forEach(p => _this.checkCollisionPair(p.bodyA, p.bodyB));
        });

        this.createEmitters();
    }

    checkCollisionPair(bodyA, bodyB) {
        const gameObjectA = bodyA.gameObject;
        const gameObjectB = bodyB.gameObject;
        
        
        if (!(gameObjectA && gameObjectB) || (gameObjectA.isShip && gameObjectB.isShip)) {
            // world bounds has no gameObject
            return;
        }

        if (gameObjectA.isShip) {
            // console.log('bodyA.gameObject.collideWithShip(bodyB.gameObject)', bodyA, bodyB)
            if (gameObjectA.collideWithShip(gameObjectB)) {
                if (!removeArrayElement(this.floatingObjects, gameObjectB)) {
                    console.log('gameObjectB not removed', gameObjectB);
                }
                this.mouseHoldConstraint.stopDrag();
            }
        } else if (gameObjectB.isShip) {
            // console.log('bodyB.gameObject.collideWithShip(bodyA.gameObject)', bodyB, bodyA)
            if (gameObjectB.collideWithShip(gameObjectA)) {
                if (!removeArrayElement(this.floatingObjects, gameObjectA)) {
                    console.log('gameObjectB not removed', gameObjectA);
                }
                this.mouseHoldConstraint.stopDrag();
            }
        } else {
        }
    }

    createNUILayer() {
        this.mouseHoldConstraint = this.matter.add.pointerConstraint(); // Allow mouse to pick up and drag objects

        this.scene.launch('navInterfaceScene');
        this.controlUi = this.game.scene.getScene('navInterfaceScene');
    }

    createEmitters() {
        this.emitters = shapeNames.map((name, index) => {
            const emitter = this.add.particles(0, 0, `tetromino-${name}`, {
                lifespan: 25,
                speed: 0,
                scale: 0.25,
                color: [ 0xFF_FF_FF, 0 ],
                emitting: false,
            });
            emitter.setDepth(100 + index);


            const fieldName = `emitter${name.toUpperCase()}`;
            // console.log(`Adding emitter ${fieldName} to alignmentDevScene and alignmentDevScene.playerShip`);
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
                // gameObject.x += deltaX;
                // gameObject.y += deltaY;

                gameObject.setVelocity(deltaX, deltaY);
            }
        });
    }
}