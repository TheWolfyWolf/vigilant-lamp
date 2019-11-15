// Global Variables
var player;
var worldMap = [];
var visibleMap;

var moveSpeed = 1/3;

var blocksContainer = new PIXI.Container();
var playersContainer = new PIXI.Container();
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

// Inventory Item Class (for storing blocks)
class InventoryItem {
    constructor(itemID,count) {
        this.id = itemID;
        this.count = count | 1;
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
    
    toString() {
        return JSON.stringify({
            id: this.id,
            count: this.count,
            isTool: this.isTool
        });
    }
}

// Inventory Tool Class (for storing tools)
class Tool {
    constructor(toolID,toolLevel,durability) {
        this.tool = toolID;
        this.damage = toolLevel.damage;
        this.durability = durability | toolLevel.durability;
        this.level = toolLevel
        this.isTool = true;
        this.img = "images/heart.png";
    }
    
    toString() {
        return JSON.stringify({
            tool: this.tool,
            level: this.level,
            isTool: this.isTool,
            durability: this.durability
        });
    }
}
// Inventory Class, for storing players inventory
class Inventory {
    constructor(){
        this.inv = [];
        this.holding = 0;
        this.size = 15;
        for (var i =  0; i < this.size; i++){
            this.inv[i] = undefined;
        }
    }
    // Removes one item from a stack
    removeOne() {
        if (this.inv[this.holding] && this.inv[this.holding].stackable && this.inv[this.holding].count > 0) {
            this.inv[this.holding].count -= 1;
            if (this.inv[this.holding].count <= 0) {
                this.inv[this.holding] = undefined;
            }
        }
        updateInv();
    }
    toString() {
        var out = "";
        this.inv.forEach(function(item) {
            if (item) {
                out += "," + item.toString();
            } else {
                out += ",null";
            }
        });
        return "[" + out.substr(1,(out.length-1)) + "]";
    }
    
    loadInventory(invToLoad) {
        for (var i = 0; i < invToLoad.length; i++) {
            if (i < this.inv.length) {
                if (invToLoad[i]) {
                    if (invToLoad[i].isTool) {
                        this.inv[i] = new Tool(invToLoad[i].tool,invToLoad[i].level,invToLoad[i].durability);
                    } else {
                        this.inv[i] = new InventoryItem(invToLoad[i].id,invToLoad[i].count);
                    }
                }
            }
        }
    }
}

// Player Class
class Player {
    constructor(x, y, ident) {
        this.id = ident;
        this.jumping = 0;
        this.sprite = createPlayer();
        this.spawn(x,y);
        app.stage.addChild(this.sprite);
        this.floored = false;
        this.health = 10;
        this.blocksFell = 0;
        this.inventory = new Inventory();
        this.updateHearts();
        this.updateHotBar();
        this.spawnx = x;
        this.spawny = y;
    }
    // Changes the players spawn
    setSpawn(x,y) {
        this.spawnx = x;
        this.spawny = y;
    }
    
    // Places the players hand (if a block)
    placeHand() {
        // Gets the mouse position
        var rawPos = app.stage.toLocal(app.renderer.plugins.interaction.mouse.global);
        var blockPos = rawPosToBlock(rawPos);
        blockPos.x = Math.floor(blockPos.x);
        blockPos.y = Math.ceil(blockPos.y);
        
        // Check the player can see where they want to place
        if (this.lineOfSight(blockPos.x,blockPos.y)) {
            // Check that the player has an item and it isn't a tool
            if (this.inventory.inv[this.inventory.holding] && !this.inventory.inv[this.inventory.holding].isTool) {
                // Places block and removes from players inventory
                setBlock(this.inventory.inv[this.inventory.holding].id,blockPos);
                this.inventory.removeOne();
                this.updateHotBar();
            }
        }
    }
    
    // Spawns the player (safe teleport)
    spawn(x,y) {
        if (x<0) {
            x = 0;
        }
        if (y<0) {
            if (worldMap[x]) {
                y = worldMap[x].length;
            } else {
                y = worldMap[0].length += 100;
            }
        }
        var down = true;
        var currentY = y;
        // Checks if the block beneath the player is solid, if not moves them down 1 block
        //  Until y=0, then starts going up
        var working = true;
        while (working) {
            if ((worldMap[parseInt(x)] && worldMap[parseInt(x)][parseInt(currentY-1)] && worldMap[parseInt(x)][parseInt(currentY-1)].solid())) {
                working = false;
            }
            if (down) {
                currentY -= 1;
            } else {
                currentY += 1;
            }
            if (currentY < 1) {
                down = false;
                currentY = y;
            }
            console.log(currentY);
            if (currentY > worldMap[parseInt(x)].length) {
                console.log("BAD SPAWN");
                this.setSpawn(0,worldMap[0].length);
                x = worldMap[0].length;
                currentY = worldMap[0].length;
                working = false;
            }
        }
        // Teleports the player to the position
        console.log("Spawning @ " + x + "," + currentY);
        this.teleport(parseInt(x),parseInt(currentY+1));
    }
    
    // Updates the players hotbar
    updateHotBar() {
        // First five items of inventory is the hotbar
        var hotbar = this.inventory.inv.slice(0,5);
        for (var i = 0; i < hotbar.length; i++) {
            // Adds/Removes selected tag from each item
            if (i == this.inventory.holding) {
                $(`.item.item-${i+1}`).addClass("selected");
            } else {
                $(`.item.item-${i+1}`).removeClass("selected");
            }
            // If no item then removes the img
            if (hotbar[i] == undefined) {
                $(`.item.item-${i+1}`).attr("src","");
                $(`.item.item-${i+1}`).attr("count","");
            } else {
                // Else adds the image
                $(`.item.item-${i+1}`).attr("src",hotbar[i].img);
                $(`.item.item-${i+1}`).attr("content",hotbar[i].count);
            }
        }
        updateInv();
    }
    
    // Jumps
    jump() {
        var jumpHeight = 7;
        // Checks that the player isn't currently jumping and is on the floor
        if (this.jumping == 0 && this.floored) {
            this.jumping = jumpHeight/moveSpeed;
        }
    }
    
    // Move Left
    moveLeft() {
        if (this.sprite.x > 0) {
            this.sprite.x -= blockSize * moveSpeed;
        }
    }
    // Move Right
    moveRight() {
        this.sprite.x += blockSize * moveSpeed;
    }
    
    // Sends players location to the server
    updateLocation() {
        socket.emit("playerLocation",this.pos());
    }
    
    // Teleports the player
    teleport(x,y,relative) {
        if (relative == true) {
            // Works out the x position relative to the player
            this.sprite.x = (this.pos().x + x)*blockSize;
            this.sprite.y = app.screen.height - ((this.pos().y + y)*blockSize);
        } else {
            // Teleports the player to the location specified
            this.sprite.x = x*blockSize;
            this.sprite.y = app.screen.height - y*blockSize;
        }
    }
    
    // Gets the players position
    pos() {
        return getPos(this.sprite);
    }
    
    // Damages the player
    damage(amount) {
        this.health -= amount;
        this.updateHearts();
    }
    
    // Heals the player
    heal(amount) {
        this.health += amount;
        this.updateHearts();
    }
    
    // Updates players health
    updateHearts() {
        // Removes hidden class from any hearts less than/equal to the players health
        for (var i = 1; i <= this.health; i++) {
            $(`.heart.heart-${i}`).removeClass("hidden");
        }
        // Adds hidden class to the rest
        for (var i = this.health+1; i <= 10; i++) {
            $(`.heart.heart-${i}`).addClass("hidden");
        }
        // Checks if the player has less than 0 health
        if (this.health <= 0) {
            // Respawns the player
            this.health = 10;
            this.updateHearts();
            this.spawn(this.spawnx,this.spawny);
        }
        saveHearts();
    }
    
    // Checks if a player has free inventory space for an item
    freeInventorySpace(item) {
        var freeSpace = 0;
        // Loops thru every item in the inventory
        for (var i = 0; i < this.inventory.inv.length; i++) {
            // If no item there, or item exists and is stackable
            if (this.inventory.inv[i] == undefined || (this.inventory.inv[i].item == item && this.inventory.inv[i].stackable)) {
                freeSpace++;
            }
        }
        updateInv();
        // Returns freeSpace
        return freeSpace;
    }
    
    // Gives the player a tool
    giveTool(toolID,toolLevel) {
        for (var i = 0; i < this.inventory.inv.length; i++) {
            if (this.inventory.inv[i] == undefined) {
                this.inventory.inv[i] = new Tool(toolID,toolLevel);
                this.updateHotBar();
                return true;
            }
        }
        return false;
    }
    
    // Gives the player an item
    giveItem(item) {
        if  (item != 0) {
            for (var i = 0; i < this.inventory.inv.length; i++) {
                if (this.inventory.inv[i] != undefined && this.inventory.inv[i].id == item) {
                    this.inventory.inv[i].count++;
                    this.updateHotBar();
                    return true;
                }
            }
            for (var i = 0; i < this.inventory.inv.length; i++) {
                if (this.inventory.inv[i] == undefined) {
                    this.inventory.inv[i] = new InventoryItem(item);
                    this.updateHotBar();
                    return true;
                }
            }
        }
        return false;
    }
    
    // Checks if a player has line of sight
    lineOfSight(x,y) {
        
        // Gets players position
        var pPos = this.pos();
        
        // Works out distance to block
        var changeX = x-pPos.x;
        var changeY = y-pPos.y;
        var dist = Math.sqrt(changeX**2 + changeY**2);
        // If >5 then too
        if (dist > 5) {
            return false;
        }
        
        // Works out the gradient
        /*
            If gradient == 0 then horizontal
            If gradient == Infinity then vertical
            Else == A diaganol line
        */
        var grad = changeY/changeX;
        
        // Creates working variables
        var workingX = pPos.x;
        var workingY = pPos.y;
        if (Math.abs(grad) == 0) {
            // Horizontal
            // Checks if block is to the right (pPox.x<x) or left of the player
            if (pPos.x < x) {
                // Checks every block inbetween player and block checking if it's occupied
                while (workingX < x) {
                    if (worldMap.length > workingX && worldMap[Math.floor(workingX)].length > workingY) {
                        if (Math.floor(workingX) != Math.floor(x) || Math.floor(workingY) != Math.floor(y)) {
                            if (worldMap[Math.floor(workingX)][Math.floor(workingY)] != undefined && worldMap[Math.floor(workingX)][Math.floor(workingY)].solid()) {
                                return false;
                            }
                        }
                    }
                    workingX += 1;
                }
            } else {
                // Checks every block inbetween player and block checking if it's occupied
                while (workingX > x) {
                    if (worldMap.length > workingX && worldMap[Math.floor(workingX)].length > workingY) {
                        if (Math.floor(workingX) != Math.floor(x) || Math.floor(workingY) != Math.floor(y)) {
                            if (worldMap[Math.floor(workingX)][Math.floor(workingY)] != undefined && worldMap[Math.floor(workingX)][Math.floor(workingY)].solid()) {
                                return false;
                            }
                        }
                    }
                    workingX -= 1;
                }
            }
        } else if (Math.abs(grad) == Infinity) {
            // Vertical
            // Checks if block is above or below the player
            if (pPos.y < y) {
                // Checks every block inbetween player and block checking if it's occupied
                while (workingY < y) {
                    if (worldMap.length > workingX && worldMap[Math.floor(workingX)].length > workingY) {
                        if (Math.floor(workingX) != Math.floor(x) || Math.floor(workingY) != Math.floor(y)) {
                            if (worldMap[Math.floor(workingX)][Math.floor(workingY)] != undefined && worldMap[Math.floor(workingX)][Math.floor(workingY)].solid()) {
                                return false;
                            }
                        }
                    }
                    workingY += 1;
                }
            } else {
                // Checks every block inbetween player and block checking if it's occupied
                while (workingY > y) {
                    if (worldMap.length > workingX && worldMap[Math.floor(workingX)].length > workingY) {
                        if (Math.floor(workingX) != Math.floor(x) || Math.floor(workingY) != Math.floor(y)) {
                            if (worldMap[Math.floor(workingX)][Math.floor(workingY)] != undefined && worldMap[Math.floor(workingX)][Math.floor(workingY)].solid()) {
                                return false;
                            }
                        }
                    }
                    workingY -= 1;
                }
            }
        } else {
            // Diag
            
            // Checks if gradient is greater than 1
            // I.e. Checks whether X or Y value increases more
            // E.g. If changeY = 4 & changeX = 2 then grad = 2
            //      So we should change Y each time and work out the X to match
            //      (If we changed X each time then we would only change X twice, so only work out
            //       Two values of Y as opposed to all 4)
            // When Working out X or Y values rearrange equation y-y1 = m(x-x1)
            // Where    x = workingX
            //          y = workingY
            //          x1 = x
            //          y1 = y
            if (grad > 1) {
                // Goes up more than one for every accross
                // Change y each time
                // Use Equation:
                // x = x1 + (y-y1)/m
                if (pPos.y < y) {
                    while (workingY < y) {
                        workingX = x + (workingY-y)/grad;
                        if (worldMap.length > workingX && worldMap[Math.round(workingX)].length > workingY) {
                            if (Math.round(workingX) != Math.floor(x) || Math.round(workingY) != Math.floor(y)) {
                                if (worldMap[Math.round(workingX)][Math.round(workingY)] != undefined && worldMap[Math.round(workingX)][Math.round(workingY)].solid()) {
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
                                if (worldMap[Math.round(workingX)][Math.round(workingY)] != undefined && worldMap[Math.round(workingX)][Math.round(workingY)].solid()) {
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
                                if (worldMap[Math.round(workingX)][Math.round(workingY)] != undefined && worldMap[Math.round(workingX)][Math.round(workingY)].solid()) {
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
                                if (worldMap[Math.round(workingX)][Math.round(workingY)] != undefined && worldMap[Math.round(workingX)][Math.round(workingY)].solid()) {
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
    
    checkCollisions() {
        
        // Gets Players position
        var pPos = this.pos()
        var pX = pPos.x;
        var floorPX = Math.floor(pX);

        var pHeadY = pPos.y;
        var ceilPHeadY = Math.ceil(pPos.y);
        var pFeetY = pPos.y-1;
        var ceilPFeetY = Math.ceil(pPos.y-1);
        
        // Variables to store blocks above, below, left, & right
        var underBlocks = [];
        var aboveBlocks = [];
        var rightBlocks = [];
        var leftBlocks = [];

        // Checks if player is covering 1 or more horizontal
        // (if pX is the same as floored pX then player is only covering one)
        // (if Px is different to floored pX then player is covering two)
        if (pX == floorPX) {
            if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPFeetY-1)) {
                // Adds blocks to arrays
                underBlocks.push(worldMap[floorPX][ceilPFeetY-1]);
                underBlocks.push(worldMap[floorPX][ceilPFeetY]);
                aboveBlocks.push(worldMap[floorPX][ceilPHeadY]);
            }
        } else {
            // Adds blocks to arrays
            if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPFeetY-1)) {
                underBlocks.push(worldMap[floorPX][ceilPFeetY-1]);
                underBlocks.push(worldMap[floorPX][ceilPFeetY]);
                aboveBlocks.push(worldMap[floorPX][ceilPHeadY]);
            }
            if (worldMap[floorPX] && (worldMap.length > floorPX+1) && (worldMap[floorPX+1].length>ceilPFeetY-1)) {
                underBlocks.push(worldMap[floorPX+1][ceilPFeetY-1]);
                underBlocks.push(worldMap[floorPX+1][ceilPFeetY]);
                aboveBlocks.push(worldMap[floorPX+1][ceilPHeadY]);
            }
        }

        // Collisions
        var b = new Bump(PIXI);
        
        // No Collisions on free cam
        if (!freeCam) {

            // Check above player
            for (var cBlock = 0; cBlock < aboveBlocks.length; cBlock++) {
                var currentBlock = aboveBlocks[cBlock];
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
            
            // Gravity
            if (!hasFloor && player.jumping == 0) {
                player.sprite.y += blockSize * moveSpeed;
                player.blocksFell += moveSpeed;
                //console.log("Falling");
            } else {
                // Fall damage
                if (player.blocksFell > 0) {
                    if (player.blocksFell > 10) {
                        //console.log(player.blocksFell);
                        player.damage(Math.floor((player.blocksFell-10)/2));
                    }
                    player.blocksFell = 0;
                }
            }

            // Checks if player is covering 2 or more vertical
            // Adds blocks to arrays
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

            // Checks collisions for left and right blocks
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
    }
}

// Class for other palyers
class OtherPlayer {
    constructor(id,pos) {
        this.id = id;
        this.sprite = PIXI.Sprite.from('images/stoneBackground.jpg');
        this.sprite.width = blockSize;
        this.sprite.height = 2* blockSize;
        this.sprite.x = pos.x*blockSize;
        this.sprite.y = app.screen.height - pos.y*blockSize;
        playersContainer.addChild(this.sprite);
        this.sprite.interactive = true;
        this.sprite.on('click', damagePlayer)
        this.sprite.id = id;
    }
    // Set Location
    setLoc(pos) {
        this.sprite.x = pos.x*blockSize;
        this.sprite.y = app.screen.height - pos.y*blockSize;
    }
}

function damagePlayer() {
    // Change for other damage
    var damage = 2;
    hurtPlayer(this.id,damage);
}

// Class to store other players
class Players {
    constructor() {
        this.players = {}
    }
    // Set player locaiton for ID
    setPlayerLocation(id,pos) {
        // If player already exists then set their location
        // Otherwise create the player
        if (id in this.players) {
            this.players[id].setLoc(pos);
        } else {
           //console.log("new player " + id);
            this.players[id] = new OtherPlayer(id,pos);
        }
    }
    // Removes a player
    removePlayer(id) {
        if (id in this.players) {
           //console.log("Removing Player")
            playersContainer.removeChild(this.players[id].sprite);
            delete this.players[id];
        }
    }
    // Removes all players that aren't in the active players array
    allActive(ids) {
        for (var key in this.players) {
            if (this.players.hasOwnProperty(key)) {
                if (!ids.includes(key)) {
                    this.removePlayer(key);
                }
            }
        }
    }
}
// Creates other players array
var otherPlayers = new Players();

// Called when the document is ready
$(document).ready(function() {
    // Creates the pixi App
    app = new PIXI.Application({ backgroundColor: 0x1099bb, resizeTo: document.getElementById("container") });
    // Adds the app to the container
    document.getElementById("container").appendChild(app.view);
    // Adds the blocks and players container
    app.stage.addChild(blocksContainer);
    app.stage.addChild(playersContainer);
    window.setTimeout(function() {
        // Calculates block size
        blockSize = parseInt(app.screen.width/blocksPerWidth);
        blockSize -= blockSize % 3;
        setupGame();
    },300);
});

// Creates a player using the player info
function loadPlayer(playerInfo) {
    // Checks the player doesn't already exists
    if (!player) {
        // Creates the player
        player = new Player(playerInfo.lastx,playerInfo.lasty);
        player.setSpawn(playerInfo.spawnx,playerInfo.spawny);
        player.health = playerInfo.health;
        player.updateHotBar();
        player.updateHearts();
        var parsedInv = JSON.parse(playerInfo.inventory);
        player.inventory.loadInventory(parsedInv);
        player.updateHotBar();
    }
}

// Starts the game
function startGame() {
    // Creates a new array of other players
    otherPlayers = new Players();
    
    // Add listeners
    
    //app.ticker.add(delta => gameLoop(delta)); /* Old Game Ticks */
    // Creates a game tick function calling every 20 milliseconds (1000/50 = 50 times a second)
    window.setInterval(function(){
        gameTick();
    }, 1000/50);
    
    // Adds event listeners for keyup and keydown
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    // Button to open inventory
    $("#openInv").on("click",toggleInv);
    
    $(".invSortable").sortable();
    $(".invSortable").disableSelection();
}

// Game Tick Function
function gameTick() {
    // Checks if inventory is open and player exists
    if (!invOpen && player) {
        // Sends players location to the server
        player.updateLocation();

        // Movement (uses assoc array of keys where their value is set to true when pressed and false when released)
        if (pressedKeys["65"] || pressedKeys["37"]) {
            // Left arrow or A pressed
            player.moveLeft();
        }
        if (pressedKeys["68"] || pressedKeys["39"]) {
            // Right arrow or D pressed
            player.moveRight();
        }
        if (pressedKeys["87"] || pressedKeys["38"] || pressedKeys["32"]) {
            // Up arrow or W or Space Bar pressed
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
            /*
                NO DOWN CODE
            */
            if (freeCam) {
                player.sprite.y += blockSize * moveSpeed;
            }
        }

        // Camera Locking
        /* 
            Uses Math.round() to avoid White Bars caused by PIXI
        */
        app.stage.pivot.x = Math.round(player.sprite.centerX - parseInt(app.screen.width/2));
        app.stage.pivot.y = Math.round(player.sprite.centerY - parseInt(app.screen.height/2));

        // Checks players colliisons
        player.checkCollisions();
        
        // Renders the world based on the players X position
        renderWorld(player.pos().x);
    }
}

function gameLoop(delta){
    
    /* DEPRECATED GAME LOOP */
    /* DEPRECATED GAME LOOP */
    /* DEPRECATED GAME LOOP */
    /* DEPRECATED GAME LOOP */
    
}

// Function to render world
function renderWorld(pX) {
    // Floors (rounds down) the users x coordinate
    var floorPX = Math.floor(pX);
    // Checks if the X coordinate is outside of the prerendered area (renderedMinX and renderedMaxX)
    if (pX < renderedMinX || pX > renderedMaxX || initialRender) {
        // Load/unload blocks
        // How Many Widths to load
        // More = less often rendered + more demanding render
        // Less = more often rendered + less demanding render
        var widthsToLoad = 5;
        var renderRegion = Math.ceil(blocksPerWidth*widthsToLoad);
        
        // Works out the new renderedMinX and renderedMaxX
        renderedMinX = pX - Math.ceil(blocksPerWidth*((widthsToLoad/2)-1));
        renderedMaxX = pX + Math.floor(blocksPerWidth*((widthsToLoad/2)-1));
        
        // Loads every vertical chunk in the new render region
        for (var x = 0; x < renderRegion; x++) {
            // Finds the vertical chunk
            var verticalChunk = worldMap[floorPX-Math.ceil(renderRegion/2)+x];
            // Makes sure the vertical chunk exists
            if (verticalChunk != undefined) {
                // Goes thru every block in the vertical chunk
                for (var y = 0; y < verticalChunk.length; y++) {
                    // Makes sure the block exists
                    if (verticalChunk[y] != undefined) {
                        // Unrenders blocks at the edge of the render region
                        if (x < renderRegion*.1 || x > renderRegion*.9) {
                            // Unload to left/right
                            verticalChunk[y].unload();
                        } else {
                            // Renders middle blocks
                            verticalChunk[y].load();
                        }
                    }
                }
            }
        }
        // updates initialRender to show that the screen has been rendered at least once
        initialRender = false;
    }
}

// Called when a key is released
function onKeyUp(key) {
    // Checks if the key is in the pressed keys assoc array
    // I.e. the key is a movement key
    if (key.keyCode in pressedKeys) {
        // Sets to false to let program know the key is no longer being pressed
        pressedKeys[key.keyCode] = false;
    }
}

// Called when a key is pressed
function onKeyDown(key) {
    // Checks if the key is in the pressed keys assoc array
    // I.e. the key is a movement key
    if (key.keyCode in pressedKeys) {
        // Sets to true to let program know the key is being pressed
        pressedKeys[key.keyCode] = true;
    } else {
        // If not a movement key 
        // Switch the keyCode
        /*
            key.keyCode:
                49 = 1 button
                50 = 2 button
                51 = 3 button
                52 = 4 button
                53 = 5 button
                69 = e button
                81 = q button
        */
        switch (key.keyCode) {
            case 49:
                // Switch inv item
                player.inventory.holding = 0;
                break;
            case 50:
                // Switch inv item
                player.inventory.holding = 1;
                break;
            case 51:
                // Switch inv item
                player.inventory.holding = 2;
                break;
            case 52:
                // Switch inv item
                player.inventory.holding = 3;
                break;
            case 53:
                // Switch inv item
                player.inventory.holding = 4;
                break;
            case 69:
                // Toggle the inventory
                toggleInv();
                break;
            case 81:
                // Place current block (if possible)
                player.placeHand();
                break;
            default:
               //console.log(key.keyCode);
                break;
        }
        // Update the players hotbar
        player.updateHotBar();
    }
}

// Function to toggle the inventory
function toggleInv() {
    
    //opens popup and loads in the inventroy by calling the function from Iventory class
    console.log(player.inventory.inv);
    // Checks if inventory open
    if (invOpen) {
        // Closing inv
        // Stores inv stage
        // Loads world stage
        //$("#inventory").addClass("reverseAni");
        $("#container").removeClass("hide").addClass("show");
        $("#inventory").removeClass("show").addClass("hide");
    } else  {
        // Opening inv
        // Stores world stage
        // Loads inv stage
        $("#container").removeClass("show").addClass("hide");
        $("#inventory").removeClass("hide").addClass("show");
        //$("#inventory").removeClass("reverseAni");
    }
    // Toggles invOpen
    invOpen = !invOpen;
}

/* DEPRECATED */
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
/* DEPRECATED */
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

// Mouse up after being down on block
function blockPointerUp() {
    this.alpha = 1;
}
// Mouse up after being down on block
function blockPointerUpOutside() {
    this.alpha = 1;
}
// Mouse down on block
function blockPointerDown() {
    // Gets block position
    var blockPos = getPos(this);
    // Gets block in worldMap
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    // Checks if the player has line of sight
    if (player.lineOfSight(blockPos.x,blockPos.y)) {
        // If so sets alpha to .6 (lets the user know the clicked it)
        this.alpha = .6;
    }
}
// Block Clicked
function damageBlock() {
    // Gets block position
    var blockPos = getPos(this);
    // Gets block in worldMap
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    // Checks if the player has line of sight
    if (player.lineOfSight(blockPos.x,blockPos.y)) {
        // Creates a placeholder player hand variable (to pass to server without passing JS class objects)
        var playerHand = {isTool: false};
        
        // If the player is holding a tool
        if (player.inventory.inv[player.inventory.holding] && player.inventory.inv[player.inventory.holding].isTool) {
            // Mutates playerHand to add players tool info
            playerHand = {
                tool: player.inventory.inv[player.inventory.holding].tool,
                damage: player.inventory.inv[player.inventory.holding].damage,
                level: player.inventory.inv[player.inventory.holding].level,
                isTool: true,
                durability: player.inventory.inv[player.inventory.holding].durability
            };
            
            // Checks if the tool is the right tool for the block
            if (blocks[blockInfo.blockID].tool == player.inventory.inv[player.inventory.holding].tool) {
                // If it is deal extra damage to the block
                blockInfo.damage += player.inventory.inv[player.inventory.holding].damage;
                // Damage the tool
                player.inventory.inv[player.inventory.holding].durability -= 1;
            } else {
                // if it isn't deal extra damage to the tool
                player.inventory.inv[player.inventory.holding].durability -= 2;
            }
            
            // Destroy tool if no durability left
            if (player.inventory.inv[player.inventory.holding].durability <= 0) {
                player.inventory.inv[player.inventory.holding] = undefined;
            }
        }
        
        // Tell the server to damage a block
        socket.emit('damageBlock', {blockPos: blockPos,playerHand:playerHand});
    }
}

/* DEPRECATED */
function OLD__damageBlock() {
    var blockPos = getPos(this);
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    if (player.lineOfSight(blockPos.x,blockPos.y)) {
        if (blockInfo.hardness() > 0) {
            if (player.inventory.inv[player.inventory.holding] != undefined && player.inventory.inv[player.inventory.holding].isTool) {
                if (blocks[blockInfo.blockID].tool == player.inventory.inv[player.inventory.holding].tool) {
                    blockInfo.damage += player.inventory.inv[player.inventory.holding].damage;
                    player.inventory.inv[player.inventory.holding].durability -= 1;
                } else {
                    player.inventory.inv[player.inventory.holding].durability -= 2;
                }
                if (player.inventory.inv[player.inventory.holding].durability <= 0) {
                    player.inventory.inv[player.inventory.holding] = undefined;
                }
            }
            blockInfo.damage += 1;
            if (blockInfo.damage >= blocks[blockInfo.blockID].hardness) {
                if (blocks[blockInfo.blockID].minTool != toolLevels.none) {
                    if (player.inventory.inv[player.inventory.holding] != undefined &&
                        player.inventory.inv[player.inventory.holding].isTool &&
                        player.inventory.inv[player.inventory.holding].level >= blocks[blockInfo.blockID].minTool &&
                        blocks[blockInfo.blockID].tool == player.inventory.inv[player.inventory.holding].tool) {
                        blockInfo.dropLoot();
                    }
                } else {
                    blockInfo.dropLoot();
                }
                blockDeleted(blockPos);
                deleteBlock(blockPos.x,blockPos.y)
            }
        }
    }
}
