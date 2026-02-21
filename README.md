# TETROMANIA

A tetromino-based endless runner. Written using Phaser on Javascript.

## Grading
FIXME Remove all TODO notes

### Creative Tilt
This endless runner focuses on piloting a ship around asteroids, amassing their ship for protection. This involved writing a grid-connecting system in order to handle the connection logic and flush additions to the ship grid while avoiding unsightly rounding errors.
I also made all of the art in this game, nothing recycled from the web. The tetrominos, the 32 asteroid sprites, and particles are all original. The particles are my reused creations from the Rocket Patrol Mod project.

### Use multiple Scene classes (dictated by your game's style)
- PlanetSide.js instructs the player to tactially learn the cursor by "pulling" it into orbit. Functionally, it is the tutorial.
- Initialize.js prepares game assets.
- Orbit.js manages the game.
- NavInterface.js overlay owns the cursor UI element.
- MainMenu.js scene with TETROMANIA title and PLAY button
- GameOver.js overlay to either start over or go to menu
- Credits.js for crediting the developer.

### Properly transition between Scenes and allow the player to restart w/out having to reload the page
Game Over scene instructs player to respawn by pressing "REINCARNATE", or perhaps instead click "RETURN TO MENU".

### Include in-game instructions using text or other means (e.g., tooltips, tutorial, diagram, etc.)
The control element in this game is a hollow-white circular cursor which the player drags with a mouse. Thus, the tutorial has the player "launch a rocket" so that the game can demonstrate the cursor logic.

### Have some form of player input/control appropriate to your game design
Drag the cursor at the middle/lower-bottom of the screen to navigate the ship.

### Include one or more animated characters that use a texture atlas/sprite sheet*
TODO animated tetrominos?

### Simulate scrolling with a tileSprite (or equivalent means)
TODO space parallax

### Implement proper collision detection (via Arcade Physics or a custom routine)
Utilized MatterJS instead of Arcade

### Have looping background music*
TODO

### Use a minimum of four sound effects for key mechanics, UI, and/or significant events appropriate to your game design
TODO
- Asteroid impacts
  - vs Asteroid
  - vs Tetromino
- Tetromino connection
- Rocket sound when player increases speed

### Use randomness to generate escalating challenge, e.g. terrain, pickups, etc.
TODO increase density of asteroid population over time

### Include some metric of accomplishment that a player can improve over time, e.g., score, survival time, etc.
TODO Score based off of time, multiplied by player's collection of pieces at a given time

### Be theoretically endless
Orbit.js initializes wrapBounds which is used by asteroids and tetrominos to wrap around the player's space. The bounds enclose an area that is several times bigger than the game window.

### Be playable for at least 15 seconds for a new player of low to moderate skill
TODO playtest

### Run without significant crashes or errors
TODO playtest

### Include in-game credits for all roles, assets, music, etc.
TODO button from Main Menu scene
