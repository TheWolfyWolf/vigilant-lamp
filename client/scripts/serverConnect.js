// Called when the document is ready
function setupGame() {
    // Connects to server
    socket = io();
    
    // Requests the world
    socket.emit('worldRequest', true);
    // Handles recieving the world
    socket.on('currentWorld', function(world){
        // Converts the world to a worldMap
        worldMap = strToWorldMap(world);
        // Updates the world
        updateWorld().then(function() {
            // Says the world has been recieved
            worldRecieved = true;

            // If world recieved and playerInfo recieved then starts the game
            if (worldRecieved && playerInfoRecieved) {
                startGame();
            }
        });;
        
    });
    
    // Requests the player
    socket.emit('playerRequest', true);
    // Handles recieving the player
    socket.on('currentPlayer', function(playerInfo){
        
        // Loads a player using the info requested
        loadPlayer(playerInfo);
        // Says the player has been recieved
        playerInfoRecieved = true;
        
        // If world recieved and playerInfo recieved then starts the game
        if (worldRecieved && playerInfoRecieved) {
            startGame();
        }
    });
    
    // Handles losing connection to the server
    socket.io.on('connect_error', function(err) {
        // Logs, alerts then redirects
        console.log('Error connecting to server');
        alert("Sorry couldn't connect to the server");
        window.location = "/";
    });
    
    // Handles a block being delted
    socket.on('blockDeleted', function(pos){
        deleteBlock(pos.x,pos.y);
    });
    
    // Handles a block being places
    socket.on('blockPlaced', function(info){
        setBlock(info.blockid,info.pos);
    });
    
    // Handles a ping return
    socket.on('pingReturn', function(startTime){
        // Calculates ping time
        var ping = Date.now()-parseInt(startTime);
        console.log("Ping: " + ping);
    });
    
    // Handles the user breaking a block
    socket.on('blockBroken', function(blockID) {
        // Creates a temporary block with required blockID
        var lootBlock = new blockObject(0,0,blockID,0);
        // Drop loot then destroy the block
        lootBlock.dropLoot();
        lootBlock.destroy();
    });
    
    // Handles recieving a players location
    socket.on('playerLocation', function(info) {
        // Makes sure the world has been rendered
        if (!initialRender) {
            // Sets players location 
            var id = info.id;
            var pos = info.pos;
            otherPlayers.setPlayerLocation(id,pos);
        }
    });
    
    // Handles a player leaving
    socket.on('playerLeave', function(id) {
        // Makes sure the world has been rendered
        if (!initialRender) {
            // Logs that a player left, then removes the player
            otherPlayers.removePlayer(id);
        }
    });
    
    // Handles making sure only active players are visible
    socket.on('allActivePlayers', function(ids) {
        if (!initialRender) {
            otherPlayers.allActive(ids);
        }
    });
    
    socket.on('hurtMe', function(damage) {
        player.damage(damage);
    });
    
    socket.on('messageRecieve', function(message) {
        /*
        <div class="message"><span class="from">${message.from}:</span>&nbsp;<span class="contents">${message.message}</span></div>
        */
        if (!chatOpen) {
                $("#gameOuter").addClass("unreadMessage");
        }
        var date = new Date();
        var dateStr = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        if (message.server) {
            var messages = $("#messages").html();
            messages += `<div class="message"><span class='time'>[${dateStr}]</span><span class="server">${message.message}</span></div>`;
            $("#messages").html(messages);
        } else {
            var messages = $("#messages").html();
            messages += `<div class="message"><span class='time'>[${dateStr}]</span><span class="from">${message.from}:</span>&nbsp;<span class="contents">${message.message}</span></div>`;
            $("#messages").html(messages);
        }
    });
}

function sendMessage() {
    var message = $("#messagesInput").val();
    $("#messagesInput").val("");
    if (message[0] == "/") {
        // Is a command
        var fullCommand = message.substr(1,message.length-1);
        var commandParts = fullCommand.split(" ");
        var command = commandParts[0].toLowerCase();
        var args = commandParts.slice(1,commandParts.length);
        runCommand(command,args);
    } else {
        // Is a message
        socket.emit("messageSend",message);
    }
}

function spawnChanged() {
    socket.emit("spawnChange",{x:player.spawnx,y:player.spawny});
}

function hurtPlayer(id,damage) {
    socket.emit("hurtPlayer",{id:id,damage:damage});
}

// Tells the server a block was deleted at a position
function blockDeleted(pos) {
    socket.emit('blockDeleted', pos);
}

function updateInv() {
    if (player) {
        var inventory = player.inventory.toString();
        socket.emit('updateInv', inventory);
    }
}

function saveHearts() {
    if (player) {
        socket.emit('updateHearts', player.health);
    }
}

// Pings the server
function pingServer() {
    socket.emit('pingSend', `${Date.now()}`);
}
