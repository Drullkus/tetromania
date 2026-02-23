# TETROMANIA

A tetromino-based endless runner. Written using Phaser on Javascript.

FIXME Resolve all TODO notes
FIXME when a part gets destroyed, check if its the only link to other tetrominos and break those off too if orphaned
FIXME when a piece gets broken off, something involving ship container physics isn't updated, causing offsets in its attachment grid system and occasionally pieces to not fuse on collision

## Grading

### Creative Tilt
This endless runner focuses on piloting a ship around asteroids, amassing their ship for protection. This involved writing a grid-connecting system in order to handle the connection logic and flush additions to the ship grid while avoiding unsightly rounding errors.
I also made all of the art in this game, nothing recycled from the web. The tetrominos, the 32 asteroid sprites, and particles are all original. The particles are my reused creations from the Rocket Patrol Mod project.

### Use multiple Scene classes (dictated by your game's style)
- Initialize.js prepares game assets.
- MainMenu.js scene with TETROMANIA title, PLAY button, and CREDITS button.
- Credits.js for crediting the developer.
- PlanetSide.js instructs the player to tactially learn the cursor by "pulling" it into orbit. Functionally, it is the tutorial.
- Orbit.js manages the game.

- NavInterface.js overlay owns the cursor UI element.
- SpaceBackground.js contains parallax layers that pan slower than player "movement".
- GameTime.js overlay displays how long the player has been playing, and shifts the time to center of screen when game is over.
- GameOver.js overlay to either start over or go to menu.

### Properly transition between Scenes and allow the player to restart w/out having to reload the page
Game Over scene instructs player to respawn by pressing "REINCARNATE", or perhaps instead click "RETURN TO MENU".

### Include in-game instructions using text or other means (e.g., tooltips, tutorial, diagram, etc.)
The control element in this game is a hollow-white circular cursor which the player drags with a mouse. Thus, the tutorial has the player "launch a rocket" so that the game can demonstrate the cursor logic.

### Have some form of player input/control appropriate to your game design
Drag the cursor at the middle/lower-bottom of the screen to navigate the ship.

### Include one or more animated characters that use a texture atlas/sprite sheet*
The tetromino seed's sprite animation shows mini tetrominos coursing downwards and center, to be visually blasted out as particles.

### Simulate scrolling with a tileSprite (or equivalent means)
SpaceBackground.js contains 6 layers. Its top 2 layers contain space dust and scroll more closely with gameplay objects. Its bottom 4 layers are more stationary, being stars and cosmic colors which can be galaxies.

### Implement proper collision detection (via Arcade Physics or a custom routine)
Utilized MatterJS instead of Arcade

### Have looping background music*
TODO

### Use a minimum of four sound effects for key mechanics, UI, and/or significant events appropriate to your game design
- Rocket sound when player increases speed
TODO
- Asteroid impacts
  - vs Asteroid
  - vs Tetromino
- Tetromino connection

### Use randomness to generate escalating challenge, e.g. terrain, pickups, etc.
TODO increase density of asteroid population over time

### Include some metric of accomplishment that a player can improve over time, e.g., score, survival time, etc.
Player is given a time metric. A local session-persisting highscore is also displayed.

### Be theoretically endless
Orbit.js initializes wrapBounds which is used by asteroids and tetrominos to wrap around the player's space. The bounds enclose an area that is several times bigger than the game window.

### Be playable for at least 15 seconds for a new player of low to moderate skill
TODO playtest

### Run without significant crashes or errors
TODO playtest

### Include in-game credits for all roles, assets, music, etc.
All in Credits.js (`creditsScene`)
