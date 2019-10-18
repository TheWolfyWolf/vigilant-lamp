
var player;
var worldMap;
var visibleMap;

// Simulate what the server will return
function getVisibleChunks(playerX) {
    var startCol = (playerX-blocksPerWidth < 0 ? 0 : playerX-blocksPerWidth);
    var noCols = (worldMap.length - ((playerX-blocksPerWidth) < 0 ? 0 : playerX-blocksPerWidth)) < 0 ? 0 : (blocksPerWidth*2);
    return worldMap.slice(startCol,noCols);
}

$(document).ready(function() {
    worldMap = generateMap();
    console.log(worldMap);
    // Build visible area
    visibleMap = getVisibleChunks();
    buildWorld(worldMap);

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
    var playerBlocksY = Math.floor(pY/blockSize)+1;
    
    // Collisions
    var b = new Bump(PIXI);
    //b.hit(player.sprite, , true)
    
    //console.log(`Player is x-${playerBlocksX} y-${playerBlocksY}`);


}

function onKeyDown(key) {
    if (key.keyCode === 65 || key.keyCode === 37) {
        player.sprite.x -= 50;//blockSize/3;
    }
    if (key.keyCode === 68 || key.keyCode === 39) {
        player.sprite.x += 50;//blockSize/3;
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
