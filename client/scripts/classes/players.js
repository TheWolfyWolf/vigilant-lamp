// Player Class
class Player {
    constructor(x, y, spawnx, spawny) {
        this.jumping = 0;
        this.sprite = createPlayer();
        app.stage.addChild(this.sprite);
        this.hand = createPlayerHand();
        this.sprite.addChild(this.hand);
        this.floored = false;
        this.health = 10;
        this.blocksFell = 0;
        this.inventory = new Inventory();
        this.updateHearts();
        this.updateHotBar();
        this.spawnx = spawnx || x;
        this.spawny = spawny || y;
        this.prevpos = {x:x,y:y}
        this.spawn(x,y);
        this.walking = 1;
        this.damaged = 0;
    }
    // Changes the players spawn
    setSpawn(x,y) {
        this.spawnx = x;
        this.spawny = y;
        spawnChanged();
    }
    
    // Places the players hand (if a block)
    placeHand() {
        // Gets the mouse position
        var rawPos = app.stage.toLocal(app.renderer.plugins.interaction.mouse.global);
        var blockPos = rawPosToBlock(rawPos);
        blockPos.x = Math.floor(blockPos.x);
        blockPos.y = Math.ceil(blockPos.y);
        
        if (this.inventory.inv[this.inventory.holding] != undefined) {
            // Check the player can see where they want to place
            var hasLineOfSight = true;
            if (blocks[this.inventory.inv[this.inventory.holding].id].requiresSight == undefined || blocks[this.inventory.inv[this.inventory.holding].id].requiresSight) {
                hasLineOfSight = this.lineOfSight(blockPos.x,blockPos.y);
            }
            if (hasLineOfSight) {
                // Check that the player has an item and it isn't a tool
                if (this.inventory.inv[this.inventory.holding] && !this.inventory.inv[this.inventory.holding].isTool) {
                    if (blocks[this.inventory.inv[this.inventory.holding].id].customPlace) {
                        blocks[this.inventory.inv[this.inventory.holding].id].customPlace();
                    } else {
                        // Places block
                        sounds.place.play();
                        setBlock(this.inventory.inv[this.inventory.holding].id,blockPos);
                    }
                    if (blocks[this.inventory.inv[this.inventory.holding].id].removeOnPlace == undefined || blocks[this.inventory.inv[this.inventory.holding].id].removeOnPlace) {
                        this.inventory.removeOne();
                    }
                    this.updateHotBar();
                }
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
            if ((worldMap[parseInt(x)] && worldMap[parseInt(x)][parseInt(currentY-1)] && worldMap[parseInt(x)][parseInt(currentY-1)].solid()) && 
                (worldMap[parseInt(x)][parseInt(currentY)] == undefined || nonSolidBlocks.indexOf(worldMap[parseInt(x)][parseInt(currentY)].blockID) != -1) && 
                (worldMap[parseInt(x)][parseInt(currentY+1)] == undefined || nonSolidBlocks.indexOf(worldMap[parseInt(x)][parseInt(currentY+1)].blockID) != -1)) {
                console.log(`${x} ${currentY}`);
                working = false;
            }
            if (working && down) {
                currentY -= 1;
            } else if (working) {
                currentY += 1;
            }
            if (currentY < 1) {
                down = false;
                currentY = y;
            }
            if (worldMap && worldMap[parseInt(x)] && currentY > worldMap[parseInt(x)].length) {
                //this.setSpawn(0,worldMap[0].length);
                x = worldMap[0].length;
                currentY = worldMap[0].length;
                working = false;
            }
        }
        // Teleports the player to the position
        console.log("Spawning" + this.id + " @ " + x + "," + currentY);
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
                if (hotbar[i] == undefined) {
                    this.hand.texture = PIXI.Texture.EMPTY;
                } else {
                    if (hotbar[i].isTool) {
                        this.hand.texture = PIXI.Texture.from(`images/${toolImage(hotbar[i])}`);
                    } else {
                        this.hand.texture = PIXI.Texture.from(hotbar[i].img);
                    }
                }
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
                $(`.item.item-${i+1}`).attr("count",hotbar[i].count);
            }
        }
        this.updateInventory();
        updateInv();
    }
    
    updateInventory() {
        for (var i = 0; i < this.inventory.inv.length; i++) {
            if (this.inventory.inv[i] == undefined) {
                $(`#${i}.invItem img`).attr("src"," ");
                $(`#${i}.invItem img`).attr("title","");
                $(`#${i}.invItem span`).html("&nbsp;");
            } else {
                $(`#${i}.invItem img`).attr("src",this.inventory.inv[i].img);
                $(`#${i}.invItem img`).attr("title",hoverName(this.inventory.inv[i]));
                if (this.inventory.inv[i].isTool) {
                    $(`#${i}.invItem span`).html(this.inventory.inv[i].durability);
                } else {
                    $(`#${i}.invItem span`).html(this.inventory.inv[i].count);
                }
            }
        }
    }
    
    idle() {
        this.sprite.texture = playerImages.idle;
    }
    
    // Jumps
    jump() {
        var jumpHeight = 7;
        // Checks that the player isn't currently jumping and is on the floor
        if (this.jumping == 0 && this.floored) {
            this.jumping = jumpHeight/moveSpeed;
            sounds.jump.play();
        }
    }
    
    // Move Left
    moveLeft() {
        if (this.sprite.x - blockSize*moveSpeed > 0) {
            if (this.sprite.scale.x > 0) this.sprite.scale.x *= -1;
            this.sprite.x -= blockSize * moveSpeed;
            this.hand.y += Math.floor((Math.random()*11)+1)-6;
            if (this.hand.y > blockSize*1.7) {
                this.hand.y = blockSize*1.7;
            } else if (this.hand.y < blockSize*1.3) {
                this.hand.y = blockSize*1.3;
            }
            this.walking += 1;
            if (this.walking > 5) this.walking = 1;
            if (this.damaged == 0) this.sprite.texture = playerImages[`walk${this.walking}`];
            sounds.step.play();
        }
    }
    // Move Right
    moveRight() {
        if (this.sprite.scale.x < 0) this.sprite.scale.x *= -1;
        this.sprite.x += blockSize * moveSpeed;
        this.hand.y += Math.floor((Math.random()*11)+1)-6;
        if (this.hand.y > blockSize*1.7) {
            this.hand.y = blockSize*1.7;
        } else if (this.hand.y < blockSize*1.3) {
            this.hand.y = blockSize*1.3;
        }
        this.walking += 1;
        if (this.walking > 5) this.walking = 1;
        if (this.damaged == 0) this.sprite.texture = playerImages[`walk${this.walking}`];
        sounds.step.play();
    }
    
    // Sends players location to the server
    updateLocation() {
        socket.emit("playerLocation",this.pos());
    }
    
    // Teleports the player
    teleport(x,y,relative) {
        allowLargeMove = true;
        if (relative == true) {
            // Works out the x position relative to the player
            this.sprite.x = (this.pos().x + x+0.5)*blockSize;
            this.sprite.y = app.screen.height - ((this.pos().y + y)*blockSize);
        } else {
            // Teleports the player to the location specified
            this.sprite.x = (x+0.5)*blockSize;
            this.sprite.y = app.screen.height - y*blockSize;
        }
    }
    
    // Gets the players position
    pos() {
        var gotPos = getPos(this.sprite);
        gotPos.x-=.5;
        return gotPos;
    }
    
    // Damages the player
    damage(amount) {
        if (this.damaged == 0) {
            this.health -= amount;
            this.damaged = 20;
        }
        sounds.hurt.play();
        this.updateHearts();
    }
    
    // Heals the player
    heal(amount) {
        this.health += amount;
        if (this.health > 10) this.health = 10;
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
            sounds.die.play();
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
    giveItem(item,count) {
        if  (item != 0) {
            for (var i = 0; i < this.inventory.inv.length; i++) {
                if (this.inventory.inv[i] != undefined && this.inventory.inv[i].id == item) {
                    this.inventory.inv[i].count += (count||1);
                    this.updateHotBar();
                    return true;
                }
            }
            for (var i = 0; i < this.inventory.inv.length; i++) {
                if (this.inventory.inv[i] == undefined) {
                    this.inventory.inv[i] = new InventoryItem(item);
                    this.inventory.inv[i].count = (count||1);
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
                if (player.pos().y > player.blocksFell) {
                    player.blocksFell = player.pos().y;
                }
                //console.log("Falling");
            } else {
                // Fall damage
                if ((player.blocksFell - player.pos().y) > 0) {
                    var blocksFell = player.blocksFell - player.pos().y;
                    if (blocksFell > 10) {
                        //console.log(player.blocksFell);
                        player.damage(Math.floor((blocksFell-10)/2));
                    }
                    player.blocksFell = 0;
                    sounds.fall.play();
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
            if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPFeetY)) {
                rightBlocks.push(worldMap[floorPX][ceilPFeetY]);
            }
            if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPHeadY)) {
                rightBlocks.push(worldMap[floorPX][ceilPHeadY]);
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
        this.sprite.x = pos.x*(blockSize+0.5);
        this.sprite.y = app.screen.height - pos.y*blockSize;
        this.sprite.anchor.x = 0.5;
        playersContainer.addChild(this.sprite);
        this.sprite.interactive = true;
        this.sprite.on('click', damagePlayer)
        this.sprite.id = id;
        this.hand = createPlayerHand();
        this.sprite.addChild(this.hand);
        this.hasTorch = false;
        this.lightPercentage = 0;
        this.walking = 0;
    }
    // Set Location
    setLoc(pos) {
        this.sprite.x = (pos.x+0.5)*blockSize;
        this.sprite.y = app.screen.height - pos.y*blockSize;
    }
    
}

function damagePlayer() {
    // Change for other damage
    var damage = 2;
    var pos = getPos(this);
    pos.x -= 0.5;
    if (player.lineOfSight(pos.x,pos.y)) {
        hurtPlayer(this.id,damage);
    }
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
            var lastPos = getPos(this.players[id].sprite);
            lastPos.x -= 0.5;
            if (pos.x == lastPos.x) {
                this.players[id].sprite.texture = playerImages.idle;
            } else {
                this.players[id].walking++;
                if (this.players[id].walking > 5) this.players[id].walking = 1;
                this.players[id].sprite.texture = playerImages[`walk${this.players[id].walking}`];
                if (pos.x > lastPos.x) {
                    if (this.players[id].sprite.scale.x < 0) this.players[id].sprite.scale.x *= -1;
                } else {
                    if (this.players[id].sprite.scale.x > 0) this.players[id].sprite.scale.x *= -1;
                }
            }
            
            this.players[id].setLoc(pos);
        } else {
           //console.log("new player " + id);
            this.players[id] = new OtherPlayer(id,pos);
            updateInv();
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
    
    changeHand(id,item) {
        if (id in this.players) {
            if (item == undefined) {
                this.players[id].hasTorch = false;
                this.players[id].hand.texture = PIXI.Texture.EMPTY;
            } else {
                item = JSON.parse(item);
                if (item.id == 15) {
                    this.players[id].hasTorch = true;
                } else {
                    this.players[id].hasTorch = false;
                }
                if (item.isTool) {
                    this.players[id].hand.texture = PIXI.Texture.from(`images/${toolImage(tools[item.id])}`);
                } else {
                    this.players[id].hand.texture = PIXI.Texture.from(`images/${blocks[item.id].image}`);
                }
            }
        }
    }
}
