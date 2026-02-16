class Alignment extends Phaser.Scene {
    constructor() {
        super('alignmentDevScene');

        this.collided = [];
        this.snapped = [];
    }

    create() {

        const tetrominoCollisions = this.cache.json.get('tetromino_collision');
        const technologyCollisions = this.cache.json.get('technology_collision');

        this.mouseHoldConstraint = this.matter.add.pointerConstraint(); // Allow mouse to pick up and drag objects

        this.playerShip = new ShipContainer(this, gameWidth * 0.5, gameHeight * 0.5, technologyCollisions['thruster']);
        this.playerShip.onShip = true;

        this.tetrominoes = tetrominoNames.map((tetrominoName, index) => {
            return this.matter.add.sprite(128 * (index % 4) + 64, 128 * Math.floor(index / 4) + 64, tetrominoName, 0, {
                shape: tetrominoCollisions[tetrominoName]
            }).setAngle(index * 90);
        });

        // this.tetrominoes.pop().destroy();
        // this.tetrominoes.pop().destroy();
        // this.tetrominoes.pop().destroy();
        // this.tetrominoes.pop().destroy();
        // this.tetrominoes.pop().destroy();
        // this.tetrominoes.pop().destroy();

        this.matter.world.setBounds(0, 0, gameWidth, gameHeight, 9001);
        this.matter.world.disableGravity();

        // FIXME Why does moving this out of the lambda into a class function reference, cause `this` to change to the World object inside the closure?
        this.matter.world.on(Phaser.Physics.Matter.Events.COLLISION_ACTIVE, (event, bodyA, bodyB) => {
            if (!(bodyA.gameObject && bodyB.gameObject)) {
                // world bounds has no gameObject
                return;
            }

            if (bodyA.gameObject.onShip) {
                if (this.collideWithShip(event, bodyA.gameObject, bodyB.gameObject)) {
                    this.mouseHoldConstraint.stopDrag();
                }
            } else if (bodyB.gameObject.onShip) {
                if (this.collideWithShip(event, bodyB.gameObject, bodyA.gameObject)) {
                    this.mouseHoldConstraint.stopDrag();
                }
            }
        });

        // console.groupCollapsed('Emitters');
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
        // console.groupEnd('Emitters');

        this.scene.launch('navInterfaceScene');
        this.controlUi = this.game.scene.getScene('navInterfaceScene');
    }

    collideWithShip(_event, shipContainer, tetromino) {
        if (angleAcceptable(tetromino.body) && !this.playerShip.isAttached(tetromino)) {
            return shipContainer.attachPart(tetromino);
        }

        return false;
    }

    update(_time, deltaMillis) {
        if (this.controlUi) {
            const deltaSeconds = deltaMillis * 0.001;
            const speed = 8 * deltaSeconds;
            const motionDelta = this.controlUi.getControlDelta();

            const deltaX = motionDelta.controlDX * speed;
            const deltaY = motionDelta.controlDY * speed;

            this.tetrominoes.forEach(tetromino => {
                if (!this.playerShip.isAttached(tetromino)) {
                    tetromino.x += deltaX;
                    tetromino.y += deltaY;
                }
            });
        }

        this.playerShip.update(deltaMillis);

        this.tetrominoes.forEach(tetromino => tetromino.angle = snapCardinalAngleDegrees(tetromino.angle));

        /*this.tetrominoes.forEach(tetromino => {
            getBlockLattice(tetromino).forEach(({ x, y, tileX, tileY }) => {
                if (tileX == 0 && tileY == 0) {
                    this.emitterS.emitParticleAt(x, y, 1);
                } else {
                    this.emitterJ.emitParticleAt(x, y, 1);
                }
            });

            // if (this.playerShip.isAttached(tetromino)) return;

            this.emitterT.emitParticleAt(tetromino.x, tetromino.y, 1);

            const spriteOrigin = getSpriteXYFromLerpUV(tetromino, 0, 0);

            this.emitterI.emitParticleAt(spriteOrigin.x, spriteOrigin.y, 1);
        });*/
    }
}
