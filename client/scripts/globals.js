/* From Pixi.js */
var blockSize;
var app;
var blocksPerWidth = 20;

// ENUM for tools
const tools = {
    pickaxe: 1,
    axe: 2,
    shovel: 3
}

// ENUM for tool levels
const toolLevels = {
    none: 0,
    wood: {durability: 50,damage: 1},
    stone: {durability: 100,damage: 2},
    iron: {durability: 220,damage: 3},
    diamond: {durability: 500,damage: 4}
}

/* From Crafting.js */
var recipes = {
    0: {
        input: [{id: 6, count: 1}],
        output: [{isTool: false,id: 10, count: 4}]
    },
    1: {
        input: [{id: 10, count: 5}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.wood}]
    },
    2: {
        input: [{id: 10, count: 5}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.wood}]
    },
    3: {
        input: [{id: 10, count: 3}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.wood}]
    },
    4: {
        input: [{id:10, count: 2},{id: 1, count: 1}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.stone}]
    },
    5: {
        input: [{id:10, count: 2},{id: 1, count: 3}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.stone}]
    },
    6: {
        input: [{id:10, count: 2},{id: 1, count: 3}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.stone}]
    },
    7: {
        input: [{id:10, count: 2},{id: 8, count: 1}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.iron}]
    },
    8: {
        input: [{id:10, count: 2},{id: 8, count: 3}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.iron}]
    },
    9: {
        input: [{id:10, count: 2},{id: 8, count: 3}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.iron}]
    },
    10: {
        input: [{id:10, count: 2},{id: 9, count: 1}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.diamond}]
    },
    11: {
        input: [{id:10, count: 2},{id: 9, count: 3}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.diamond}]
    },
    12: {
        input: [{id:10, count: 2},{id: 9, count: 3}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.diamond}]
    }
}

/* From Engine.js */
var player;
var worldMap = [];
var visibleMap;

var moveSpeed = 1/3;

var blocksContainer = new PIXI.Container();
var playersContainer = new PIXI.Container();
var invOpen = false;
var craftOpen = false;

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

// Dict to handle all block info
/*
    Stores:
        - Image
        - Hardness
        - (Ideal) tool
        - Min Tool
*/
const blocks = {
    1: {image:"stone.jpg",hardness:10, tool:tools.pickaxe, minTool:toolLevels.wood,name:"Stone"},
    2: {image:"stoneBackground.jpg", hardness:10, tool:tools.pickaxe, minTool:toolLevels.stone,name:"Stone Background"},
    3: {image:"dirt.jpg",hardness:4, tool:tools.shovel, minTool:toolLevels.none,name:"Dirt"},
    4: {image:"grass.jpeg",hardness:5, tool:tools.shovel, minTool: toolLevels.none,name:"Grass"},
    5: {image:"bedrock.png",hardness:-1,name:"Bedrock"},
    6: {image:"wood.png",hardness:1,tool:tools.axe, minTool:toolLevels.none,name:"Wood"},
    7: {image:"leaf.png",hardness:1,tool:tools.axe, minTool:toolLevels.none,name:"Leaf"},
    8: {image:"iron.png",hardness:1,tool:tools.pickaxe, minTool:toolLevels.stone,name:"Iron"}, /* ORE */
    9: {image:"diamond.jpeg",hardness:1,tool:tools.pickaxe, minTool:toolLevels.iron,name:"Diamond"}, /* ORE */
    10: {image:"planks.jpg",hardness:1,tool:tools.axe, minTool:toolLevels.none,name:"Wood Planks"}
}

/* From ServerConnect.js */
var socket;

var worldRecieved = false;
var playerInfoRecieved = false;

/* From WorldGen.js */
const nonSolidBlocks = [0,2];