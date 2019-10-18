
var player;
var worldMap;
var visibleMap;

// Simulate what the server will return
function getVisibleChunks(playerX) {
    var startCol = (playerX-blocksPerWidth < 0 ? 0 : playerX-blocksPerWidth);
    var noCols = (worldMap.length - ((playerX-blocksPerWidth) < 0 ? 0 : playerX-blocksPerWidth)) < 0 ? 0 : (blocksPerWidth*2);
    return [startCol,worldMap.slice(startCol,noCols)];
}

$(document).ready(function() {
    worldMap = generateMap();

    player = createPlayer(50,51);

    app.ticker.add(delta => gameLoop(delta));
    document.addEventListener('keydown', onKeyDown);

});

function gameLoop(delta){
    // Player Pos
    var pX = player.sprite.x;
    var pY = player.sprite.y;

    // Camera Locking
    app.stage.pivot.x = pX - parseInt(app.screen.width/2);
    app.stage.pivot.y = pY - parseInt(app.screen.height/2);

    // Player Pos In Blocks
    var playerBlocksX = Math.floor(pX/blockSize);
    var playerBlocksY = Math.floor(pY/blockSize);

    // Build visible area
    returned = getVisibleChunks(playerBlocksX);
    startCol = returned[0];
    visibleMap = returned[1];
    buildWorld(startCol,visibleMap);
    
    // Collisions
    if (!visibleMap[playerBlocksX+startCol][playerBlocksY+1]) {
        // There is no floor
        player.sprite.y += blockSize/3;
    } else {
        // Is a floor
        // Make sure player reaches it
    }
    console.log(visibleMap[playerBlocksX+startCol][playerBlocksY+1]);
    
    //console.log(`Player is x-${playerBlocksX} y-${playerBlocksY}`);


}

function onKeyDown(key) {
    if (key.keyCode === 65 || key.keyCode === 37) {
        player.sprite.x -= blockSize/3;
    }
    if (key.keyCode === 68 || key.keyCode === 39) {
        player.sprite.x += blockSize/3;
    }
    if (key.keyCode === 87 || key.keyCode === 38 || key.keyCode === 32) {
        //jump code
        player.sprite.y -= 3;
    }
    if (key.keyCode === 40 || key.keyCode === 83) {
        //Down code
        player.sprite.y += 3;
    }
}
