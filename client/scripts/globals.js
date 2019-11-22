/* From Pixi.js */
var blockSize;
var app;
var blocksPerWidth = 20;

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

var initialRender = true;
var renderedMinX = 0;
var renderedMaxX = 0;

var freeCam = false;

var invSelected = false;

// Creates other players array
var otherPlayers = new Players();

/* From ServerConnect.js */
var socket;

var worldRecieved = false;
var playerInfoRecieved = false;