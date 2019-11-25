/* From Pixi.js */
var blockSize;
var app;
var blocksPerWidth = 20;

/* From Players.js */
var playerImages = {
    idle: PIXI.Texture.from("images/player/idle.png"),
    hurt: PIXI.Texture.from("images/player/hurt.png"),
    walk1: PIXI.Texture.from("images/player/walk1.png"),
    walk2: PIXI.Texture.from("images/player/walk2.png"),
    walk3: PIXI.Texture.from("images/player/walk3.png"),
    walk4: PIXI.Texture.from("images/player/walk4.png"),
    walk5: PIXI.Texture.from("images/player/walk5.png")
};

/* From Engine.js */
var player;
var worldMap = [];
var visibleMap;

var time = 0;
var allowLargeMove = true;

var moveSpeed = 1/3;

var blocksContainer = new PIXI.Container();
var playersContainer = new PIXI.Container();
var invOpen = false;
var craftOpen = false;
var chatOpen = false;
var allRecipesVisible = false;

var pressedKeys = {
    65: false,
    37: false,
    68: false,
    39: false,
    87: false,
    38: false,
    32: false,
    40: false
};

var sounds = {
    hurt: new Audio("sounds/hurt.mp3"),
    step: new Audio("sounds/step.wav"),
    die: new Audio("sounds/death.wav"),
    break: new Audio("sounds/break.wav"),
    place: new Audio("sounds/place.wav"),
    fall: new Audio("sounds/fall.wav"),
    jump: new Audio("sounds/jump.wav")
}
var volume = 1;

var initialRender = true;
var renderedMinX = 0;
var renderedMaxX = 0;

var freeCam = false;

var invSelected = false;

// Creates other players array
var otherPlayers;

/* From ServerConnect.js */
var socket;

var worldRecieved = false;
var playerInfoRecieved = false;