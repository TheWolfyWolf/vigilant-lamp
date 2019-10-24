var socket;

$(document).ready(function() {
    socket = io();
    socket.emit('worldRequest', true);
    socket.on('currentWorld', function(world){
        worldMap = strToWorldMap(world);
        updateWorld();
        console.log("Recieved World");
        if (initialRender) {
            startGame();
        }
    });
    
    socket.on('blockDeleted', function(pos){
        deleteBlock(pos.x,pos.y);
        console.log("Block Deleted");
    });
    
    socket.on('pingReturn', function(startTime){
        console.log(startTime);
        var ping = Date.now()-parseInt(startTime);
        console.log("Ping: " + ping);
    });
    
    socket.on('blockBroken', function(blockID) {
        var lootBlock = new blockObject(0,0,blockID,0);
        lootBlock.dropLoot();
    });
});

function blockDeleted(pos) {
    socket.emit('blockDeleted', pos);
}

function pingServer() {
    socket.emit('pingSend', `${Date.now()}`);
}
