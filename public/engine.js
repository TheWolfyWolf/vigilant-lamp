
var player;
var worldMap;
var visibleMap;

var moveSpeed = 1/3;

var worldStage = new PIXI.Container();
var invStage = new PIXI.Container();
var invOpen = false;

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

class InventoryItem {
    constructor(itemID) {
        this.id = itemID;
        this.count = 1;
        this.stackable = true;
        this.isTool = false;
        if (itemID > 0) {
            // Block
            this.img = `images/${blocks[itemID].image}`;
        } else {
            // Tool/other
            this.img = "images/heart.png";
        }
    }
}

class Tool {
    constructor(toolID,toolLevel) {
        this.tool = toolID;
        this.damage = toolLevel.damage;
        this.durability = toolLevel.durability;
        this.level = toolLevel
        this.isTool = true;
        this.img = "images/heart.png";
    }
}

class Player {
    constructor(x,y) {
        this.jumping = 0;
        this.sprite = createPlayer(x,y);
        app.stage.addChild(this.sprite);
        this.floored = false;
        this.health = 10;
        this.blocksFell = 0;
        this.inventory = [];
        this.holding = 0;
        for (var i = 0; i < 15; i++) {
            this.inventory.push(undefined);
        }
        this.inventory[4] = new InventoryItem(-1);
    }
    
    updateHotBar() {
        var hotbar = this.inventory.slice(0,5);
        for (var i = 0; i < hotbar.length; i++) {
            if (i == this.holding) {
                $(`.item.item-${i+1}`).addClass("selected");
            } else {
                $(`.item.item-${i+1}`).removeClass("selected");
            }
            if (hotbar[i] == undefined) {
                $(`.item.item-${i+1}`).attr("src","");
                $(`.item.item-${i+1}`).attr("count","");
            } else {
                $(`.item.item-${i+1}`).attr("src",hotbar[i].img);
                $(`.item.item-${i+1}`).attr("content",hotbar[i].count);
            }
        }
    }
    
    jump() {
        if (this.jumping == 0 && this.floored) {
            this.jumping = 7/moveSpeed;
        }
    }
    
    moveLeft() {
        if (this.sprite.x > 0) {
            this.sprite.x -= blockSize * moveSpeed;
        }
    }
    moveRight() {
        this.sprite.x += blockSize * moveSpeed;
    }
    
    teleport(x,y,relative) {
        if (relative == true) {
            this.sprite.x = (this.pos().x + x)*blockSize;
            this.sprite.y = app.screen.height - ((this.pos().y + y)*blockSize);
        } else {
            this.sprite.x = x*blockSize;
            this.sprite.y = app.screen.height - y*blockSize;
        }
    }
    
    pos() {
        return getPos(this.sprite);
    }
    
    damage(amount) {
        this.health -= amount;
        this.updateHearts();
    }
    
    heal(amount) {
        this.health += amount;
        this.updateHearts();
    }
    
    updateHearts() {
        for (var i = 1; i <= this.health; i++) {
            $(`.heart.heart-${i}`).removeClass("hidden");
        }
        for (var i = this.health+1; i <= 10; i++) {
            $(`.heart.heart-${i}`).addClass("hidden");
        }
    }
    
    freeInventorySpace(item) {
        var freeSpace = 0;
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] == undefined || (this.inventory[i].item == item && this.inventory[i].stackable)) {
                freeSpace++;
            }
        }
        return freeSpace;
    }
    
    giveTool(toolID,toolLevel) {
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] == undefined) {
                this.inventory[i] = new Tool(toolID,toolLevel);
                this.updateHotBar();
                return true;
            }
        }
        return false;
    }
    
    giveItem(item) {
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] != undefined && this.inventory[i].id == item) {
                this.inventory[i].count++;
                this.updateHotBar();
                return true;
            }
        }
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i] == undefined) {
                this.inventory[i] = new InventoryItem(item);
                this.updateHotBar();
                return true;
            }
        }
        return false;
    }
    
    lineOfSight(x,y) {
        
        var pPos = this.pos();
        
        var changeX = x-pPos.x;
        var changeY = y-pPos.y;
        var dist = Math.sqrt(changeX**2 + changeY**2);
        if (dist > 5) {
            return false;
        }
        var grad = changeY/changeX;
        
        var workingX = pPos.x;
        var workingY = pPos.y;
        if (Math.abs(grad) == 0) {
            // Horizontal
            if (pPos.x < x) {
                while (workingX < x) {
                    if (worldMap.length > workingX && worldMap[Math.floor(workingX)].length > workingY) {
                        if (Math.floor(workingX) != Math.floor(x) || Math.floor(workingY) != Math.floor(y)) {
                            if (worldMap[Math.floor(workingX)][Math.floor(workingY)] != undefined) {
                                return false;
                            }
                        }
                    }
                    workingX += 1;
                }
            } else {
                while (workingX > x) {
                    if (worldMap.length > workingX && worldMap[Math.floor(workingX)].length > workingY) {
                        if (Math.floor(workingX) != Math.floor(x) || Math.floor(workingY) != Math.floor(y)) {
                            if (worldMap[Math.floor(workingX)][Math.floor(workingY)] != undefined) {
                                return false;
                            }
                        }
                    }
                    workingX -= 1;
                }
            }
        } else if (Math.abs(grad) == Infinity) {
            // Vertical
            if (pPos.y < y) {
                while (workingY < y) {
                    if (worldMap.length > workingX && worldMap[Math.floor(workingX)].length > workingY) {
                        if (Math.floor(workingX) != Math.floor(x) || Math.floor(workingY) != Math.floor(y)) {
                            if (worldMap[Math.floor(workingX)][Math.floor(workingY)] != undefined) {
                                return false;
                            }
                        }
                    }
                    workingY += 1;
                }
            } else {
                while (workingY > y) {
                    if (worldMap.length > workingX && worldMap[Math.floor(workingX)].length > workingY) {
                        if (Math.floor(workingX) != Math.floor(x) || Math.floor(workingY) != Math.floor(y)) {
                            if (worldMap[Math.floor(workingX)][Math.floor(workingY)] != undefined) {
                                return false;
                            }
                        }
                    }
                    workingY -= 1;
                }
            }
        } else {
            // Diag
            // y-y1 = m(x-x1)
            
            //workingX += 0.5;
            //workingY += 0.5;
            if (grad > 1) {
                // Goes up more than one for every accross
                // Change y each time
                // x = x1 + (y-y1)/m
                if (pPos.y < y) {
                    while (workingY < y) {
                        workingX = x + (workingY-y)/grad;
                        if (worldMap.length > workingX && worldMap[Math.round(workingX)].length > workingY) {
                            if (Math.round(workingX) != Math.floor(x) || Math.round(workingY) != Math.floor(y)) {
                                if (worldMap[Math.round(workingX)][Math.round(workingY)] != undefined) {
                                    return false;
                                }
                            }
                        }
                        workingY += 1/3;
                    }
                } else {
                    while (workingY > y) {
                        workingX = x + (workingY-y)/grad;
                        if (worldMap.length > workingX && worldMap[Math.round(workingX)].length > workingY) {
                            if (Math.round(workingX) != Math.floor(x) || Math.round(workingY) != Math.floor(y)) {
                                if (worldMap[Math.round(workingX)][Math.round(workingY)] != undefined) {
                                    return false;
                                }
                            }
                        }
                        workingY -= 1/3;
                    }
                }
            } else {
                // Goes accross more than one for every up
                // Change x each time
                // y = y1 + m(x-x1)
                if (pPos.x < x) {
                    while (workingX < x) {
                        workingY = y + (workingX-x)*grad;
                        if (worldMap.length > workingX && worldMap[Math.round(workingX)].length > workingY) {
                            if (Math.round(workingX) != Math.floor(x) || Math.round(workingY) != Math.floor(y)) {
                                if (worldMap[Math.round(workingX)][Math.round(workingY)] != undefined) {
                                    return false;
                                }
                            }
                        }
                        workingX += 1/3;
                    }
                } else {
                    while (workingX > x) {
                        workingY = y + (workingX-x)*grad;
                        if (worldMap.length > workingX && worldMap[Math.round(workingX)].length > workingY) {
                            if (Math.round(workingX) != Math.floor(x) || Math.round(workingY) != Math.floor(y)) {
                                if (worldMap[Math.round(workingX)][Math.round(workingY)] != undefined) {
                                    return false;
                                }
                            }
                        }
                        workingX-= 1/3;
                    }
                }
            }
        }
        
        return true;
    }
}

// Simulate what the server will return
function getVisibleChunks(playerX) {
    return worldMap;
    
    var startCol = (playerX-blocksPerWidth < 0 ? 0 : playerX-blocksPerWidth);
    var noCols = (worldMap.length - ((playerX-blocksPerWidth) < 0 ? 0 : playerX-blocksPerWidth)) < 0 ? 0 : (blocksPerWidth*2);
    return worldMap.slice(startCol,noCols);
}

$(document).ready(function() {
    
    app = new PIXI.Application({ backgroundColor: 0x1099bb, resizeTo: document.getElementById("container") });
    document.getElementById("container").appendChild(app.view);

    blockSize = parseInt(app.screen.width/blocksPerWidth);
    blockSize -= blockSize % 3;
    
    worldMap = generateMap();
    console.log(worldMap);
    // Build visible area
    visibleMap = getVisibleChunks();
    worldMap[48][166] = new blockObject(48,46,1);
    worldMap[52][165] = new blockObject(52,45,2);
    worldMap[53][166] = new blockObject(53,46,3);
    worldMap[54][167] = new blockObject(54,47,4);
    worldMap[55][168] = new blockObject(55,48,1);
    worldMap[56][169] = new blockObject(56,49,1);
    worldMap[57][170] = new blockObject(57,50,1);
    worldMap[50][168] = new blockObject(50,48,1);
    buildWorld();

    player = new Player(50,165);
    player.updateHotBar();
    player.updateHearts();
    
    
    // Add listeners
    app.ticker.add(delta => gameLoop(delta));
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    $("#openInv").on("click",toggleInv);

});

function gameLoop(delta){
    if (!invOpen) {

        // Movement
        if (pressedKeys["65"] || pressedKeys["37"]) {
            player.moveLeft();
        }
        if (pressedKeys["68"] || pressedKeys["39"]) {
            player.moveRight();
        }
        if (pressedKeys["87"] || pressedKeys["38"] || pressedKeys["32"]) {
            //jump code
            if (!freeCam) {
                player.jump();
            } else {
                player.sprite.y -= blockSize * moveSpeed;
            }
        }
        if (pressedKeys["40"] || pressedKeys["40"]) {
            //Down code
            //player.sprite.y += blockSize/3;
        }

        // Get Player pos
        var pPos = player.pos();

        var pX = pPos.x;
        var floorPX = Math.floor(pX);

        var pHeadY = pPos.y;
        var ceilPHeadY = Math.ceil(pPos.y);
        var pFeetY = pPos.y-1;
        var ceilPFeetY = Math.ceil(pPos.y-1);

        // Camera Locking
        app.stage.pivot.x = Math.round(player.sprite.centerX - parseInt(app.screen.width/2));
        app.stage.pivot.y = Math.round(player.sprite.centerY - parseInt(app.screen.height/2));

        var underBlocks = [];
        var aboveBlocks = [];
        var rightBlocks = [];
        var leftBlocks = [];

        // Checks if player is covering 1 or more horizontal
        if (pX == floorPX) {
            if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPFeetY-1)) {
                underBlocks.push(worldMap[floorPX][ceilPFeetY-1]);
                underBlocks.push(worldMap[floorPX][ceilPFeetY]);
                aboveBlocks.push(worldMap[floorPX][ceilPHeadY]);
            }
        } else {
            if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPFeetY-1)) {
                underBlocks.push(worldMap[floorPX][ceilPFeetY-1]);
                underBlocks.push(worldMap[floorPX][ceilPFeetY]);
                aboveBlocks.push(worldMap[floorPX][ceilPHeadY]);
            }
            if (worldMap[floorPX] && (worldMap[floorPX+1].length>ceilPFeetY-1)) {
                underBlocks.push(worldMap[floorPX+1][ceilPFeetY-1]);
                underBlocks.push(worldMap[floorPX+1][ceilPFeetY]);
                aboveBlocks.push(worldMap[floorPX+1][ceilPHeadY]);
            }
        }

        // Collisions
        var b = new Bump(PIXI);

        if (!freeCam) {

            // Check above player
            for (var cBlock = 0; cBlock < aboveBlocks.length; cBlock++) {
                var currentBlock = aboveBlocks[cBlock];
                //console.log(currentBlock);
                if (currentBlock && currentBlock.solid() && currentBlock.sprite != undefined) {
                    if (b.hit(player.sprite,currentBlock.sprite,true) != "bottom") {
                        player.jumping = 0;
                    }
                }
            }
            if (player.jumping > 0) {
                player.jumping -= 1;
                player.sprite.y -= blockSize * moveSpeed;
            }

            // Check beneath player
            var hasFloor = false;
            player.floored = false;
            for (var cBlock = 0; cBlock < underBlocks.length; cBlock++) {
                var currentBlock = underBlocks[cBlock];
                //console.log(currentBlock);
                if (currentBlock && currentBlock.solid() && currentBlock.sprite != undefined) {
                    if (b.hit(player.sprite,currentBlock.sprite,true) != "bottom") {
                        hasFloor = true;
                        player.floored = true;
                    }
                }
            }
            if (!hasFloor && player.jumping == 0) {
                player.sprite.y += blockSize * moveSpeed;
                player.blocksFell += moveSpeed;
                //console.log("Falling");
            } else {
                // Fall damage
                if (player.blocksFell > 0) {
                    if (player.blocksFell > 10) {
                        console.log(player.blocksFell);
                        player.damage(Math.floor((player.blocksFell-10)/2));
                    }
                    player.blocksFell = 0;
                }
            }



            // Checks if player is covering 2 or more vertical
            if (worldMap[floorPX-1] && (worldMap[floorPX-1].length>ceilPFeetY)) {
                leftBlocks.push(worldMap[floorPX-1][ceilPFeetY]);
            }
            if (worldMap[floorPX-1] && (worldMap[floorPX-1].length>ceilPHeadY)) {
                leftBlocks.push(worldMap[floorPX-1][ceilPHeadY]);
            }

            if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPFeetY)) {
                leftBlocks.push(worldMap[floorPX][ceilPFeetY]);
            }
            if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPHeadY)) {
                leftBlocks.push(worldMap[floorPX][ceilPHeadY]);
            }

            if (worldMap[floorPX+1] && (worldMap[floorPX+1].length>ceilPFeetY)) {
                rightBlocks.push(worldMap[floorPX+1][ceilPFeetY]);
            }
            if (worldMap[floorPX+1] && (worldMap[floorPX+1].length>ceilPHeadY)) {
                rightBlocks.push(worldMap[floorPX+1][ceilPHeadY]);
            }

            for (var cBlock = 0; cBlock < leftBlocks.length; cBlock++) {
                var currentBlock = leftBlocks[cBlock];
                //console.log(currentBlock);
                if (currentBlock && currentBlock.solid() && currentBlock.sprite != undefined) {
                    b.hit(player.sprite,currentBlock.sprite,true);
                }
            }
            for (var cBlock = 0; cBlock < rightBlocks.length; cBlock++) {
                var currentBlock = rightBlocks[cBlock];
                //console.log(currentBlock);
                if (currentBlock && currentBlock.solid() && currentBlock.sprite != undefined) {
                    b.hit(player.sprite,currentBlock.sprite,true);
                }
            }
        }

        if (pX < renderedMinX || pX > renderedMaxX || initialRender) {
            // Load/unload blocks
            //console.log("Loading chunks");
            var widthsToLoad = 5;
            var renderRegion = Math.ceil(blocksPerWidth*widthsToLoad);
            renderedMinX = pX - Math.ceil(blocksPerWidth*((widthsToLoad/2)-1));
            renderedMaxX = pX + Math.floor(blocksPerWidth*((widthsToLoad/2)-1));
            for (var x = 0; x < renderRegion; x++) {
                //console.log(pX-Math.floor(widthsToLoad/2));
                var verticalChunk = worldMap[floorPX-Math.ceil(renderRegion/2)+x];
                if (verticalChunk != undefined) {
                    for (var y = 0; y < verticalChunk.length; y++) {
                        if (verticalChunk[y] != undefined) {
                            //if (pX-Math.ceil(renderRegion/2)+x > pX+Math.ceil(blocksPerWidth*(widthsToLoad/2)) || pX-Math.ceil(renderRegion/2)+x < pX-Math.ceil(blocksPerWidth*(widthsToLoad/2))) {
                            if (x < renderRegion*.1) {
                                // Unload to left
                                verticalChunk[y].unload();
                            } else if (x > renderRegion*.9) {
                                // Unload to right
                                verticalChunk[y].unload();
                            } else {
                                verticalChunk[y].load();
                            }
                        }
                    }
                }
            }
            initialRender = false;
        }
    }
    
    //b.hit(player.sprite, , true)
    
    //console.log(`Player is x-${playerBlocksX} y-${playerBlocksY}`);

}

function onKeyUp(key) {
    if (key.keyCode in pressedKeys) {
        pressedKeys[key.keyCode] = false;
    }
}

function onKeyDown(key) {
    if (key.keyCode in pressedKeys) {
        pressedKeys[key.keyCode] = true;
    } else {
        switch (key.keyCode) {
            case 49:
                player.holding = 0;
                break;
            case 50:
                player.holding = 1;
                break;
            case 51:
                player.holding = 2;
                break;
            case 52:
                player.holding = 3;
                break;
            case 53:
                player.holding = 4;
                break;
            case 69:
                toggleInv();
                break;
        }
        player.updateHotBar();
    }
}

function toggleInv() {
    if (invOpen) {
        // Closing inv
        invStage = app.stage;
        app.stage = worldStage;
    } else  {
        // Opening inv
        worldStage = app.stage;
        app.stage = invStage;
    }
    invOpen = !invOpen;
}

function blockMouseEnter() {
    // Removed bc mouse leave doesnt work if player moves
    /*
    var blockPos = getPos(this);
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    if (player.lineOfSight(blockPos.x,blockPos.y)) {
        this.alpha = .8;
    }
    */
}
function blockMouseLeave() {
    // Removed bc mouse leave doesnt work if player moves
    /*
    var blockPos = getPos(this);
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    if (player.lineOfSight(blockPos.x,blockPos.y)) {
        this.alpha = 1;
    }
    */
}
function blockPointerUp() {
    var blockPos = getPos(this);
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    if (player.lineOfSight(blockPos.x,blockPos.y)) {
        this.alpha = 1;
    }
}

function blockPointerUpOutside() {
    var blockPos = getPos(this);
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    if (player.lineOfSight(blockPos.x,blockPos.y)) {
        this.alpha = 1;
    }
}
function blockPointerDown() {
    var blockPos = getPos(this);
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    if (player.lineOfSight(blockPos.x,blockPos.y)) {
        this.alpha = .6;
    }
}

function damageBlock() {
    var blockPos = getPos(this);
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    if (player.lineOfSight(blockPos.x,blockPos.y)) {
        if (blockInfo.hardness() > 0) {
            if (player.inventory[player.holding] != undefined && player.inventory[player.holding].isTool) {
                if (blocks[blockInfo.blockID].tool == player.inventory[player.holding].tool) {
                    blockInfo.damage += player.inventory[player.holding].damage;
                    player.inventory[player.holding].durability -= 1;
                } else {
                    player.inventory[player.holding].durability -= 2;
                }
                if (player.inventory[player.holding].durability <= 0) {
                    player.inventory[player.holding] = undefined;
                }
            }
            blockInfo.damage += 1;
            if (blockInfo.damage >= blocks[blockInfo.blockID].hardness) {
                if (blocks[blockInfo.blockID].minTool != toolLevels.none) {
                    if (player.inventory[player.holding] != undefined &&
                        player.inventory[player.holding].isTool &&
                        player.inventory[player.holding].level >= blocks[blockInfo.blockID].minTool &&
                        blocks[blockInfo.blockID].tool == player.inventory[player.holding].tool) {
                        blockInfo.dropLoot();
                    }
                } else {
                    blockInfo.dropLoot();
                }
                app.stage.removeChild(this);
                worldMap[blockPos.x][blockPos.y] = undefined;
            }
        }
    }
}
