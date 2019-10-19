
var player;
var worldMap;
var visibleMap;

var moveSpeed = 1/3;

var freeCam = false;

class Player {
    constructor(x,y) {
        this.jumping = 0;
        this.sprite = createPlayer(x,y);
        this.floored = false;
    }
    
    jump() {
        if (this.jumping == 0 && this.floored) {
            this.jumping = 7/moveSpeed;
        }
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
    worldMap = generateMap();
    console.log(worldMap);
    // Build visible area
    visibleMap = getVisibleChunks();
    worldMap[48][46] = new blockObject(48,46,1);
    worldMap[52][45] = new blockObject(52,45,1);
    worldMap[53][46] = new blockObject(53,46,1);
    worldMap[50][48] = new blockObject(50,48,1);
    buildWorld();

    player = new Player(50,47);

    app.ticker.add(delta => gameLoop(delta));
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyDown);

});

function gameLoop(delta){
    // Get Player pos
    var pPos = getPos(player.sprite);
    
    var pX = pPos.x;
    var floorPX = Math.floor(pX);
    
    var pHeadY = pPos.y;
    var ceilPHeadY = Math.ceil(pPos.y);
    var pFeetY = pPos.y-1;
    var ceilPFeetY = Math.ceil(pPos.y-1);

    // Camera Locking
    app.stage.pivot.x = player.sprite.x - parseInt(app.screen.width/2);
    app.stage.pivot.y = player.sprite.y - parseInt(app.screen.height/2);
    
    var underBlocks = [];
    var aboveBlocks = [];
    var rightBlocks = [];
    var leftBlocks = [];
    
    // Checks if player is covering 1 or more horizontal
    if (pX == floorPX) {
        if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPFeetY-1)) {
            underBlocks.push(worldMap[floorPX][ceilPFeetY-1]);
            aboveBlocks.push(worldMap[floorPX][ceilPHeadY]);
        }
    } else {
        if (worldMap[floorPX] && (worldMap[floorPX].length>ceilPFeetY-1)) {
            underBlocks.push(worldMap[floorPX][ceilPFeetY-1]);
            aboveBlocks.push(worldMap[floorPX][ceilPHeadY]);
        }
        if (worldMap[floorPX] && (worldMap[floorPX+1].length>ceilPFeetY-1)) {
            underBlocks.push(worldMap[floorPX+1][ceilPFeetY-1]);
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
            console.log(player.jumping);
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
    
    
    //b.hit(player.sprite, , true)
    
    //console.log(`Player is x-${playerBlocksX} y-${playerBlocksY}`);

}

function onKeyDown(key) {
    if (key.keyCode === 65 || key.keyCode === 37) {
        player.sprite.x -= blockSize * moveSpeed;
    }
    if (key.keyCode === 68 || key.keyCode === 39) {
        player.sprite.x += blockSize * moveSpeed;
    }
    if (key.keyCode === 87 || key.keyCode === 38 || key.keyCode === 32) {
        //jump code
        if (!freeCam) {
            player.jump();
        } else {
            player.sprite.y -= blockSize * moveSpeed;
        }
    }
    if (key.keyCode === 40 || key.keyCode === 83) {
        //Down code
        player.sprite.y += blockSize/3;
    }
}
