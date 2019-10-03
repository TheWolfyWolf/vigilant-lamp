const app = new PIXI.Application({ backgroundColor: 0x1099bb, resizeTo: document.getElementById("container") });
document.getElementById("container").appendChild(app.view);

const blockSize = parseInt(app.screen.height/50);

function createStone(x,y) {
    const newBlock = PIXI.Sprite.from('images/stone.jpg');
    
    newBlock.x = x * blockSize;
    newBlock.y = app.screen.height- (y * blockSize);
    
    newBlock.width = blockSize;
    newBlock.height = blockSize;
    
    app.stage.addChild(newBlock);
}

function createPlayer(x,y) {
    const player = PIXI.Sprite.from('images/stoneBackground.jpg');
    
    player.x = x * blockSize;
    player.y = app.screen.height- (y * blockSize);
    
    player.width = blockSize;
    player.height = 2* blockSize;
    
    app.stage.addChild(player);
}

function buildWorld(map) {
    for (var x = 0; x < map.length; x++) {
        var innerMap = map[x];
        for (var y = 0; y < innerMap.length; y++) {
            if (innerMap[y]) {
                createStone(x,y);
                //console.log(`Creating stone @ x-${x} y-${y}`);
            }
        }
    }
}


/*

For physics use physicsjs
https://www.html5gamedevs.com/topic/2823-building-a-platformer-with-pixi-and-physicsjs-good-idea/

*/