var blockSize;
var app;
var blocksPerWidth = 25;

const blocks = {
    1: "stone.jpg",
    2: "stoneBackground.jpg",
    3: "dirt.jpg",
    4: "grass.jpeg"
}

$(document).ready(function() {
    app = new PIXI.Application({ backgroundColor: 0x1099bb, resizeTo: document.getElementById("container") });
    document.getElementById("container").appendChild(app.view);

    blockSize = parseInt(app.screen.width/blocksPerWidth);
    blockSize -= blockSize % 3;
});

function getPos(sprite) {
    return {"x":sprite.x/blockSize,"y":(app.screen.height - sprite.y)/blockSize};
}

function createBlock(x,y,block) {
    if (block == 0) return;
    const newBlock = PIXI.Sprite.from(`images/${blocks[block]}`);
    
    newBlock.x = x * blockSize;
    newBlock.y = app.screen.height- (y * blockSize);
    
    newBlock.width = blockSize;
    newBlock.height = blockSize;
    
    app.stage.addChild(newBlock);
    
    return newBlock;
}

function createPlayer(x,y) {
    const newPlayer = PIXI.Sprite.from('images/stoneBackground.jpg');
    
    newPlayer.x = x * blockSize;
    newPlayer.y = app.screen.height- (y * blockSize);
    
    newPlayer.width = blockSize;
    newPlayer.height = 2* blockSize;
    
    app.stage.addChild(newPlayer);
    
    return newPlayer;
}

function buildWorld() {
    for (var x = 0; x < worldMap.length; x++) {
        var innerMap = worldMap[x];
        for (var y = 0; y < innerMap.length; y++) {
            
            if (innerMap[y] && innerMap[y].blockID != 0 && innerMap[y].sprite == undefined) {
                innerMap[y].sprite = createBlock(x,y,innerMap[y].blockID);
            }
        }
    }
}
