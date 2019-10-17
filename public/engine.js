
var player;
var worldMap;

// Simulate what the server will return
function getVisibleChunks() {
    
}

$(document).ready(function() {
    worldMap = generateMap();
    
    player = createPlayer(50,51);
    
    app.ticker.add(delta => gameLoop(delta));
    document.addEventListener('keydown', onKeyDown);

});

function gameLoop(delta){
    // Build visible area
    buildWorld(worldMap);
    
    // Player Pos
    var pX = player.sprite.x;
    var pY = player.sprite.y;
    
    // Camera Locking
    app.stage.pivot.x = pX - parseInt(app.screen.width/2);
    app.stage.pivot.y = pY - parseInt(app.screen.height/2);
    
    // Find adjacent blocks
    var playerBlocksX = Math.floor(pX/blockSize);
    var playerBlocksY = Math.floor(pY/blockSize);
    
    console.log(`Player is x-${playerBlocksX} y-${playerBlocksY}`);
    
    
}

function onKeyDown(key) {
    if (key.keyCode === 65 || key.keyCode === 37) {
        player.sprite.x -= 15;
    }
    if (key.keyCode === 68 || key.keyCode === 39) {
        player.sprite.x += 15;
    }
    if (key.keyCode === 87 || key.keyCode === 38 || key.keyCode === 32) {
        //jump code
        player.sprite.y -= 15;
    }
    if (key.keyCode === 40 || key.keyCode === 83) {
        //Down code
        player.sprite.y += 15;
    }
    
    
}


