// Called when the document is ready
$(document).ready(function() {
    
    // Creates the pixi App
    app = new PIXI.Application({ backgroundColor: 0x1099bb, resizeTo: document.getElementById("container") });
    // Adds the app to the container
    document.getElementById("container").appendChild(app.view);
    // Adds the blocks and players container
    app.stage.addChild(blocksContainer);
    app.stage.addChild(playersContainer);
    
    window.addEventListener('resize', resized);
    window.setTimeout(function() {
        // Calculates block size
        blockSize = parseInt(app.screen.width/blocksPerWidth);
        blockSize -= blockSize % 3;
        setupGame();
    },300);
    
});

function resized() {
    renderedMinX = -100;
    renderedMaxX = -100;
    renderWorld();
}

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

// Function to hide the loading icon
function hideLoading() {
    $(".loadingIcon").each(function() {
        $(this).addClass("complete");
    });
    $(".completeIcon").each(function() {
        $(this).addClass("complete");
    });
    $("#gameOuter").addClass("show");
    $("#loadingBox").addClass("complete");
    setTimeout(function() {
        $("#loadingBox").addClass("hide");
    },3000);
}
function showLoading() {
    $(".loadingIcon").each(function() {
        $(this).removeClass("complete");
    });
    $(".completeIcon").each(function() {
        $(this).removeClass("complete");
    });
    $("#gameOuter").removeClass("show");
    $("#loadingBox").removeClass("complete");
    $("#loadingBox").removeClass("hide");
}

// Starts the game
function startGame() {
    
    // Creates a new array of other players
    otherPlayers = new Players();
    
    // Hide loading icon
    hideLoading();
    
    //app.ticker.add(delta => gameLoop(delta)); /* Old Game Ticks */
    // Creates a game tick function calling every 20 milliseconds (1000/50 = 50 times a second)
    window.setInterval(function(){
        gameTick();
    }, 1000/50);
    
    $(".invItem").each(function() {
        $(this).on("click",function() {
            console.log(invSelected);
            console.log($(this).attr("id"));
            if (invSelected === false) {
                if ($(this).attr("id") != "deleteItem") {
                    invSelected = $(this).attr("id");
                    $(this).addClass("selected");
                }
            } else {
                var currentInvID = $(this).attr("id");
                if (currentInvID == "deleteItem") {
                    player.inventory.inv[invSelected] = undefined;
                } else {
                    player.inventory.swapItem(parseInt(invSelected),parseInt(currentInvID));
                }
                $(".invItem.selected").each(function() {
                    $(this).removeClass("selected");
                })
                player.updateHotBar();
                invSelected = false;
            }
        });
    });
    
    // Adds event listeners for keyup and keydown
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    // Button to open inventory
    $("#openInv").on("click",toggleInv);
    
    
}

// Game Tick Function
function gameTick() {
    // Checks if inventory is open and player exists
    if (player) {
        // Sends players location to the server
        player.updateLocation();
        
        if ((player.pos().y % moveSpeed > 0.03 && player.pos().y % moveSpeed < 0.3) ||
            (player.pos().x % moveSpeed > 0.03 && player.pos().x % moveSpeed < 0.3)) {
            console.log("Fixing player pos " + player.pos().x % moveSpeed + " & " + player.pos().y % moveSpeed); 
            renderedMinX = -100;
            renderedMaxX = -100;
            renderWorld();
            app.renderer.render(app.stage);
            //player.teleport(Math.ceil(player.pos().x),Math.ceil(player.pos().y));
        }
        
        if (!(invOpen || craftOpen || chatOpen)) {

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
    // Checks that the player isn't typing
    if (!$("#messagesInput").is(':focus')) {
        // Checks if the key is in the pressed keys assoc array
        // I.e. the key is a movement key
        if (key.keyCode in pressedKeys) {
            // Sets to false to let program know the key is no longer being pressed
            pressedKeys[key.keyCode] = false;
        }
    }
}

// Called when a key is pressed
function onKeyDown(key) {
    // Checks that the player isn't typing
    if (!$("#messagesInput").is(':focus')) {
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
                    // E pressed, toggle the inventory
                    toggleInv();
                    break;
                case 81:
                    // Q pressed, place current block (if possible)
                    player.placeHand();
                    break;
                case 67:
                    // C pressed, open crafting
                    toggleCraft();
                    break;
                case 84:
                    // C pressed, open crafting
                    toggleChat();
                    break;
                default:
                    console.log(key.keyCode);
                    break;
            }
            // Update the players hotbar
            player.updateHotBar();
        }
    }
}

function toggleChat() {
    if (chatOpen) {
        $("#container").removeClass("hide").addClass("show");
        $("#chat").removeClass("show").addClass("hide");
        $("#inventory").removeClass("show").addClass("hide");
        $("#crafting").removeClass("show").addClass("hide");
    } else  {
        // Opening crafting
        invOpen = false;
        craftOpen = false;
        
        $("#gameOuter").removeClass("unreadMessage");
        
        $("#container").removeClass("show").addClass("hide");
        $("#chat").removeClass("hide").addClass("show");
        $("#inventory").removeClass("show").addClass("hide");
        $("#crafting").removeClass("show").addClass("hide");
    }
    chatOpen = !chatOpen;
}

function toggleCraft() {
    if (craftOpen) {
        $("#container").removeClass("hide").addClass("show");
        $("#crafting").removeClass("show").addClass("hide");
        $("#inventory").removeClass("show").addClass("hide");
        $("#chat").removeClass("show").addClass("hide");
    } else  {
        // Opening crafting
        invOpen = false;
        chatOpen = false;
        updateCraftable();
        
        $("#container").removeClass("show").addClass("hide");
        $("#crafting").removeClass("hide").addClass("show");
        $("#inventory").removeClass("show").addClass("hide");
        $("#chat").removeClass("show").addClass("hide");
    }
    craftOpen = !craftOpen;
}

// Function to toggle the inventory
function toggleInv() {
    
    //opens popup and loads in the inventroy by calling the function from Iventory class
    console.log(player.inventory.inv);
    // Checks if inventory open
    if (invOpen) {
        // Closing inv
        $("#container").removeClass("hide").addClass("show");
        $("#inventory").removeClass("show").addClass("hide");
        $("#crafting").removeClass("show").addClass("hide");
    } else  {
        // Opening inv
        craftOpen = false;
        chatOpen = false;
        $("#container").removeClass("show").addClass("hide");
        $("#inventory").removeClass("hide").addClass("show");
        $("#crafting").removeClass("show").addClass("hide");
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
