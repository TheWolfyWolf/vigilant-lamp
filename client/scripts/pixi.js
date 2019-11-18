// Global variables
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

function toolImage(tool) {
    return `tools/${hoverName(tool).replace(" ","").toLowerCase()}.png`;
}

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

// Function to get position of a sprite in blocks not standard x,y
function getPos(sprite) {
    return {"x":sprite.x/blockSize,"y":(app.screen.height - sprite.y)/blockSize};
}

// Same as above but for raw coordinates, not a sprite
function rawPosToBlock(pos) {
    return {"x":pos.x/blockSize,"y":(app.screen.height - pos.y)/blockSize};
}

// Function to create a block
function createBlock(x,y,block) {
    // 0 = air block = no block
    if (block == 0 || !block) return;
    
    // Creates a new block using the image from the above dict
    const newBlock = PIXI.Sprite.from(`images/${blocks[block].image}`);
    
    // Sets x and y coords
    newBlock.x = x * blockSize;
    newBlock.y = app.screen.height- (y * blockSize);
    
    // sets width and height
    newBlock.width = blockSize;
    newBlock.height = blockSize;
    
    // Allow block interaction
    newBlock.interactive = true;
    // Adds lots of block event listeners
    newBlock.on('click', damageBlock).on('pointerdown',blockPointerDown).on('pointerup',blockPointerUp).on('pointerupoutside',blockPointerUpOutside).on('mouseover',blockMouseEnter).on('mouseout',blockMouseLeave);
    
    // Adds to the blocks container
    blocksContainer.addChild(newBlock);
    
    // Makes invisible
    newBlock.visible = false;
    
    // Returns block object
    return newBlock;
}

// Creates a player
function createPlayer() {
    // Creates a player using player image
    const newPlayer = PIXI.Sprite.from('images/stoneBackground.jpg');
    
    // Makes the player 1 block wide and 2 tall
    newPlayer.width = blockSize;
    newPlayer.height = 2* blockSize;
    
    // Returns the new player
    return newPlayer;
}

// Build the world
function buildWorld() {
    // Goes thru every vertical chunk in the world map
    for (var x = 0; x < worldMap.length; x++) {
        var innerMap = worldMap[x];
        // Goes thru every block in the vertical chunk
        for (var y = 0; y < innerMap.length; y++) {
            //console.log(innerMap[y] + " - " + (innerMap[y] && innerMap[y].blockID != 0 && innerMap[y].sprite == undefined));
            // If the block exists, isn't air, and doesn't have a sprite
            if (innerMap[y] && innerMap[y].blockID != 0 && innerMap[y].sprite == undefined) {
                // Creates a sprite for the block
                innerMap[y].sprite = createBlock(innerMap[y].x,innerMap[y].y,innerMap[y].blockID);
                // Adds the sprite to the blocks container
                blocksContainer.addChild(innerMap[y].sprite);
            }
        }
    }
    // World needs to be rerendered, so an initialRender is necessary
    initialRender = true;
}

// Update world
// (destorys and rebuilds)
async function updateWorld() {
    // Checks world map exists
    if (worldMap) {
        // Goes thru every vertical chunk
        worldMap.forEach(function(innerMap) {
            // Goes thru every block
            innerMap.forEach(function(block) {
                // If the block exists and has a sprite, removes the sprite
                if (block && block.sprite) {
                    block.sprite = undefined;
                }
            });
        });
        // Resets blocksContainer
        blocksContainer.children = [];
        // Builds the world
        buildWorld();
    }
}

// Function to delete a block at location
function deleteBlock(x,y) {
    // Checks that the location exists
    if (worldMap && worldMap[x] && worldMap[x][y]) {
        // Tells the block to destroy itself
        worldMap[x][y].destroy();
    }
}

// sets a location to be a block
function setBlock(blockid,pos) {
    // Checks world exists
    if (worldMap) {
        // If the vertical chunk doesn't exist
        if (!worldMap[pos.x]) {
            // Creates an empty vertical chunk
            worldMap[pos.x] = [];
        }
        // Checks the position isn't already taken
        if (!worldMap[pos.x][pos.y]) {
            // Creates a new block, in location with the blockID
            worldMap[pos.x][pos.y] = new blockObject(pos.x,pos.y,blockid);
            
            // Adds the block to the blocks container
            blocksContainer.addChild(worldMap[pos.x][pos.y].sprite);
            // Renders the block if its within the render region
            if (pos.x > renderedMinX && pos.x < renderedMaxX) {
                worldMap[pos.x][pos.y].load();
            } else {
                worldMap[pos.x][pos.y].unload();
            }
            // Tells the server to place a block there
            socket.emit('blockPlaced', {blockid: blockid,pos:pos});
        } else {
            // a block already exists there
            //console.log("Block exists");
        }
    }
}

// Destroy world
function destroyWorld() {
    blocksContainer.children = [];
    worldMap = [];
}
