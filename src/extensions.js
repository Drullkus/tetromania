'use strict';

const buttonDefaults = {
    buttonColor: '#2d2d2d',
    buttonColorOver: '#8d8d8d',
}

// Inspired by "Extension functions" from Kotlin; this file adds functions to object prototypes without modifying the prototype's original js code
Phaser.Scene.prototype.createButton = function createButton(text, posX, posY, style, onDown) {
    const buttonTextObj = this.add.text(posX, posY, text, style);

    buttonTextObj.setOrigin(0.5);
    buttonTextObj.setStroke('#000', 10);
    buttonTextObj.setInteractive();
    buttonTextObj.setBackgroundColor(buttonDefaults.buttonColor);

    buttonTextObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        buttonTextObj.setBackgroundColor(buttonDefaults.buttonColorOver);
    });

    buttonTextObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        buttonTextObj.setBackgroundColor(buttonDefaults.buttonColor);
    });

    buttonTextObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, onDown, this);

    return buttonTextObj;
};
