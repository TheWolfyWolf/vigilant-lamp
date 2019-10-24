var blockSize;
var app;
var blocksPerWidth = 20;

const tools = {
    pickaxe: 1,
    axe: 2,
    shovel: 3
}

const toolLevels = {
    none: 0,
    wood: {durability: 50,damage: 1},
    stone: {durability: 100,damage: 2},
    diamond: {durability: 500,damage: 4}
}

const blocks = {
    1: {image:"stone.jpg",hardness:10, tool:tools.pickaxe, minTool:toolLevels.wood},
    2: {image:"stoneBackground.jpg", hardness:10, tool:tools.pickaxe, minTool:toolLevels.stone},
    3: {image:"dirt.jpg",hardness:4, tool:tools.shovel, minTool:toolLevels.none},
    4: {image:"grass.jpeg",hardness:5, tool:tools.shovel, minTool: toolLevels.none},
    5: {image:"bedrock.png",hardness:-1}
}

function getPos(sprite) {
    return {"x":sprite.x/blockSize,"y":(app.screen.height - sprite.y)/blockSize};
}


function createBlock(x,y,block) {
    if (block == 0 || !block) return;
    //console.log(block);
    const newBlock = PIXI.Sprite.from(`images/${blocks[block].image}`);
    
    newBlock.x = x * blockSize;
    newBlock.y = app.screen.height- (y * blockSize);
    
    newBlock.width = blockSize;
    newBlock.height = blockSize;
    
    // Allow block interaction
    newBlock.interactive = true;
    newBlock.on('click', damageBlock).on('pointerdown',blockPointerDown).on('pointerup',blockPointerUp).on('pointerupoutside',blockPointerUpOutside).on('mouseover',blockMouseEnter).on('mouseout',blockMouseLeave);
    
    blocksContainer.addChild(newBlock);
    
    newBlock.visible = false;
    
    return newBlock;
}

function createPlayer() {
    const newPlayer = PIXI.Sprite.from('images/stoneBackground.jpg');
    
    newPlayer.width = blockSize;
    newPlayer.height = 2* blockSize;
    
    //app.stage.addChild(newPlayer);
    
    return newPlayer;
}

function buildWorld() {
    for (var x = 0; x < worldMap.length; x++) {
        var innerMap = worldMap[x];
        for (var y = 0; y < innerMap.length; y++) {
            //console.log(innerMap[y] + " - " + (innerMap[y] && innerMap[y].blockID != 0 && innerMap[y].sprite == undefined));
            
            if (innerMap[y] && innerMap[y].blockID != 0 && innerMap[y].sprite == undefined) {
                innerMap[y].sprite = createBlock(innerMap[y].x,innerMap[y].y,innerMap[y].blockID);
                //console.log(innerMap[y].blockID);
                blocksContainer.addChild(innerMap[y].sprite);
            }
        }
    }
    initialRender = true;
}

function updateWorld() {
    console.log("Updating world");
    if (worldMap) {
        worldMap.forEach(function(innerMap) {
            innerMap.forEach(function(block) {
                if (block && block.sprite) {
                    block.sprite = undefined;
                }
            });
        });
        blocksContainer.children = [];
        buildWorld();
    }
    console.log("World Updated");
}

function deleteBlock(x,y) {
    if (worldMap && worldMap[x] && worldMap[x][y]) {
        console.log("deleting block @ " + x + "," + y);
        worldMap[x][y].destroy();
    }
}

function destroyWorld() {
    blocksContainer.children = [];
    worldMap = [];
}
