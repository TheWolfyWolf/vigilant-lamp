function toolImage(tool) {
    return `tools/${hoverName(tool).replace(" ","").toLowerCase()}.png`;
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
    const newPlayer = new PIXI.Sprite();
    
    newPlayer.texture = playerImages.idle;
    
    // Makes the player 1 block wide and 2 tall
    newPlayer.width = blockSize;
    newPlayer.height = 2 * blockSize;
    
    newPlayer.anchor.x = 0.5;
    
    // Returns the new player
    return newPlayer;
}

// Creates a player
function createPlayerHand() {
    const playerHand = new PIXI.Sprite();
    
    playerHand.scale.x = 1;
    playerHand.scale.y = 1;
    
    playerHand.anchor.x = 0;
    playerHand.anchor.y = -0.5;
    
    playerHand.width = blockSize*2;
    playerHand.height = blockSize;
    
    playerHand.y = blockSize*1.5;
    playerHand.x = blockSize;
    
    // Returns the players hand
    return playerHand;
}

// Build the world
function buildWorld() {
    // Goes thru every vertical chunk in the world map
    for (var x = 0; x < worldMap.length; x++) {
        var innerMap = worldMap[x];
        // Goes thru every block in the vertical chunk
        for (var y = 0; y < innerMap.length; y++) {
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
        if (!worldMap[pos.x][pos.y] || worldMap[pos.x][pos.y].blockID == 0) {
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
        }
    }
}

// Destroy world
function destroyWorld() {
    blocksContainer.children = [];
    worldMap = [];
}
