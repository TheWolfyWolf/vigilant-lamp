var blockSize;
var app;

const blocks = {
    1: "stone.jpg",
    2: "stoneBackground.jpg",
    3: "dirt.jpg",
    4: "grass.jpeg"
}

$(document).ready(function() {
    app = new PIXI.Application({ backgroundColor: 0x1099bb, resizeTo: document.getElementById("container") });
    document.getElementById("container").appendChild(app.view);

    blockSize = parseInt(app.screen.height/50);
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
}

function createPlayer(x,y) {
    const newPlayer = PIXI.Sprite.from('images/stoneBackground.jpg');
    
    newPlayer.x = x * blockSize;
    newPlayer.y = app.screen.height- (y * blockSize);
    
    newPlayer.width = blockSize;
    newPlayer.height = 2* blockSize;
    
    app.stage.addChild(newPlayer);
    
    var playerToReturn = {
        sprite: undefined
    };
    playerToReturn.sprite = newPlayer;
    return playerToReturn;
}

function buildWorld(map) {
    for (var x = 0; x < map.length; x++) {
        var innerMap = map[x];
        for (var y = 0; y < innerMap.length; y++) {
            createBlock(x,y,innerMap[y]);
        }
    }
}

/*

For physics use physicsjs
https://www.html5gamedevs.com/topic/2823-building-a-platformer-with-pixi-and-physicsjs-good-idea/

*/