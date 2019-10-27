// Globals
var width = 1000; /* Width of the world */
var height = 200; /* Height of the world */

var worldMap = undefined;

const nonSolidBlocks = [0,2];

// ENUM for tools
const tools = {
    pickaxe: 1,
    axe: 2,
    shovel: 3
}

// ENUM for tool levels
const toolLevels = {
    none: 0,
    wood: {durability: 50,damage: 1},
    stone: {durability: 100,damage: 2},
    diamond: {durability: 500,damage: 4}
}

// Dict to handle all block info
/*
    Stores:
        - Image
        - Hardness
        - (Ideal) tool
        - Min Tool
*/
const blocks = {
    1: {image:"stone.jpg",hardness:10, tool:tools.pickaxe, minTool:toolLevels.wood},
    2: {image:"stoneBackground.jpg", hardness:10, tool:tools.pickaxe, minTool:toolLevels.stone},
    3: {image:"dirt.jpg",hardness:4, tool:tools.shovel, minTool:toolLevels.none},
    4: {image:"grass.jpeg",hardness:5, tool:tools.shovel, minTool: toolLevels.none},
    5: {image:"bedrock.png",hardness:-1},
    6: {image:"wood.png",hardness:5,tool:tools.axe, minTool:toolLevels.none},
    7: {image:"leaf.png",hardness:1,tool:tools.axe, minTool:toolLevels.none}
}

// Function to convert a world map to a string
function worldMapToStr(mapToUse) {
    // Checks a map has been passed
    if (mapToUse) {
        var out = "";
        // Goes thru each vertical chunk
        mapToUse.forEach(function(column) {
            var innerOut = ",";
            // For each block in the vertical chunk
            column.forEach(function(row) {
                if (row) {
                    // Adds the block converted to a string
                    innerOut += "," + row.toString();
                }
            });
            // Adds to out, removing starting ,
            out += innerOut.substr(1,innerOut.length-1);
        });
        // Returns, removing leading comma
        return "[" + out.substr(1,out.length-1) + "]";
    }
    return "";
}

// Function to convert a string to a world map
function strToWorldMap(mapToUse) {
    outMap = [];
    mapToUse = JSON.parse(mapToUse);
    // Fore each block
    mapToUse.forEach(function(block) {
        // Checks if the vertical chunk exists
        if (!outMap[block.x]) {
            outMap[block.x] = [];
        }
        // Creates a block at the desired x & y
        outMap[block.x][block.y] = new blockObject(block.x,block.y,block.id,block.damage);
    });
    return outMap;
}


// Class to store blocks
class blockObject {
    constructor(x,y,block,damage) {
        this.x = x;
        this.y = y;
        this.blockID = block;
        this.sprite = undefined;
        this.damage = damage || 0;
    }
    
    // Checks if the block is solid
    solid() {
        for (var i = 0; i < nonSolidBlocks.length; i++) {
            if (nonSolidBlocks[i] == this.blockID) {
                return false;
            }
        }
        return true;
    }
    
    // Gets the blocks hardness
    hardness() {
        return blocks[this.blockID].hardness;
    }
    
    // Drops the blocks loot (not used in server yet)
    dropLoot() {
        if (player.freeInventorySpace(this.blockID) > 1) {
            var itemToGive = this.blockID;
            
            switch (this.blockID) {
                case 4:
                    itemToGive = 3;
                    break;
            }
            
            player.giveItem(itemToGive);
        }
    }
    
    // Converts a block to string JSON object
    toString() {
        return JSON.stringify({
            x: this.x,
            y: this.y,
            id: this.blockID,
            damage: this.damage
        });
    }
}

// Generation variables
var trueChance = 0.4;
var numSteps = 5;
var birthLimit = 4;
var deathLimit = 2;

var treeChance = 0.9;
var treeMaxHeight = 8;
var treeMinHeight = 3;
var treeMinDist = 5;

var seed = 123456;

// Function to smooth caves
// For each (potential) block - count their neighbours
// if a block and their neighbours is below the death limit, kill this block
// if air and their neighbours is above the birth limit, birth this block
function doStep(map) {
    for (var x = 0; x<map.length; x++) {
        for (var y = 0; y<map[0].length; y++) {
            var nbs = trueNeighbours(map,x,y);
            if (map[x][y].blockID) {
                if (nbs < deathLimit) {
                    map[x][y].blockID = 0;
                } else {
                    map[x][y].blockID = 1;
                }
            } else {
                if (nbs > birthLimit) {
                    map[x][y].blockID = 1;
                } else {
                    map[x][y].blockID = 0;
                }
            }
        }
    }
    return map;
}

// Function to work out how many neighbours a (potential) block has
function trueNeighbours(map,x, y){
  var count = 0;
  for (var i=-1;i<2;i++) {
    for (var j =-1;j<2;j++) {
      var neighbourX = x+i;
      var neighbourY = y+j;
      if (i==0 && j==0) {
        // Nothing
      } else if (neighbourX < 0 || neighbourY < 0 || neighbourX >= map.length || neighbourY >= map[0].length) {
        count++;
      } else if (map[neighbourX][neighbourY].blockID) {
        count++;
      }
    }
  }
  return count;
}

// Function to create a random underground that will become caves
function initialiseMap(w,h) {
  var map = [];
  for(var x = 0; x<w; x++){
    innerMap = []
      for(var y = 0; y<h; y++) {
          if ((Math.random()) < trueChance) {
              innerMap[y] = new blockObject(x,y,1);
          } else {
              innerMap[y] = new blockObject(x,y,0);
          }
      }
      map[x] = innerMap;
  }
  return map;
}

// Function to create trees
function createTrees(map) {
    var lastTree = -treeMinDist;
    for (var x = 0; x < map.length; x++) {
        if (Math.random() > treeChance && x > (lastTree+treeMinDist)) {
            lastTree = x;
            innerMap = map[x];
            for (var y = innerMap.length-1; y >= 0; y--) {
                if (innerMap[y] && innerMap[y].blockID == 4) {
                    var treeHeight = Math.round((Math.random() * (treeMaxHeight - treeMinHeight)) + treeMinHeight);
                    for (var h = 0; h < treeHeight; h++) {
                        map[x][y+h+1] = new blockObject(x,y+h+1,6);
                        if (h > 2) {
                            map[x-1][y+h+1] = new blockObject(x-1,y+h+1,7);
                            if (map[x+1]) {
                                map[x+1][y+h+1] = new blockObject(x+1,y+h+1,7);
                            }
                        }
                    }
                    map[x][y+treeHeight+1] = new blockObject(x,y+treeHeight+1,7);
                    map[x-1][y+treeHeight+1] = new blockObject(x-1,y+treeHeight+1,7);
                    if (map[x+1]) {
                        map[x+1][y+treeHeight+1] = new blockObject(x+1,y+treeHeight+1,7);
                    }
                    break;
                }
            }
        }
    }
    return map;
}

// Function to generate a full world - including caves, top level terrain, and trees
function generateMap() {
    // Cave Area
    var map = initialiseMap(width, height*.8);
    for (var i = 0; i < numSteps; i++) {
        map = doStep(map);
    }
    

    // Top Ground 
    var top = generateTop(width,height*.2);

    // Merge
    var world = [];
    for (var i = 0; i < width; i++) {
        if (map[i] != undefined && top[i] != undefined) {
            world[i] = map[i].concat(top[i]);
        }
    }
    
    // Create Trees
    world = createTrees(world);
    
    // Create bedrock
    for (var x = 0; x < world.length; x++) {
        world[x][0] = new blockObject(x,0,5);
    }
    
    // Fix Positionings
    for (var x = 0; x < world.length; x++) {
        for (var y = 0; y < world[x].length; y++) {
            if (world[x][y]) {
                world[x][y].x = x;
                world[x][y].y = y;
            }
        }
    }

    return world;
}

// Function to generate top level terrain
function generateTop(w,h) {
  var top = [];
  for (var x = 0; x < w; x++) {
    var topHeight = parseInt(getNoise(x,15));
    var innerTop = [];
    for (var y = 0; y < topHeight; y++) {
      if ((y+1) == topHeight){
          innerTop[y] = new blockObject(x,y,4);
      } else {
          innerTop[y] = new blockObject(x,y,3);
      }
    }
    top[x] = innerTop;
  }
  return top;
}


/* Used in generating top level terrain */

// PERLIN NOISE
function getNoise(x,range) {
    var selectionSize = 16  * 16;
    var noise = 0;

    range /= 2;
    while (selectionSize > 0) {

        var selectionIndex = x / selectionSize;

        var distanceToIndex = (x % selectionSize) / parseFloat(selectionSize);

        var leftRandom = random(selectionIndex, range); 
        var rightRandom = random(selectionIndex + 1, range);

        noise += (1 - distanceToIndex) * leftRandom + distanceToIndex * rightRandom;

        selectionSize /= 2;
        range /= 2;

        range = Math.max(1, range);
    }

    return Math.round(noise * (noise < 0 ? -1 : 1));
}
// PERLIN NOISE
function random(x, range) {
    return parseInt(((x + seed) ^ 10) % range);
}

// Function to damage a block, 
function damageBlock(blockPos,playerHand) {
    console.log(blockPos);
    
    // Get block information
    var blockInfo = worldMap[blockPos.x][blockPos.y];
    
    // Check that block exists
    if (blockInfo && blockInfo.hardness() > 0) {
        // Checks if player is holding a tool
        if (playerHand != undefined && playerHand.isTool) {
            // If players tool is the correct tool deal extra damage
            if (blocks[blockInfo.blockID].tool == playerHand.tool) {
                blockInfo.damage += playerHand.damage;
            }
        }
        // Damage the block
        blockInfo.damage += 1;
        // If block is broken
        if (blockInfo.damage >= blocks[blockInfo.blockID].hardness) {
            if (blocks[blockInfo.blockID].minTool != toolLevels.none) {
                // Checks that the player is holding a tool, that is the right too for the job
                if (playerHand != undefined &&
                    playerHand.isTool &&
                    playerHand.level >= blocks[blockInfo.blockID].minTool &&
                    blocks[blockInfo.blockID].tool == playerHand.tool) {
                    //blockInfo.dropLoot();
                    return 2;
                }
            } else {
                // Block had no min tool requirement, return 2 (tells prev function to drop loot)
                return 2;
            }
            // Block had min tool requirement that wasnt met, return 1 (tells prev function not to drop loot)
            return 1;
        }
    }
    // Block wasn't broken
    return 0;
}

// Function to set a block
function setBlock(blockid,pos) {
    // Checks world map exists
    if (worldMap) {
        // Checks the vertical chunk exists, if not creates it
        if (!worldMap[pos.x]) {
            worldMap[pos.x] = [];
        }
        // Places a block there if not one already there
        if (!worldMap[pos.x][pos.y]) {
            worldMap[pos.x][pos.y] = new blockObject(pos.x,pos.y,blockid);
            console.log("Block placed");
        } else {
            console.log("Block exists");
        }
    }
}

// Function to remove a block
function removeBlock(pos) {
    // Sets the blockobject to undefined
    worldMap[pos.x][pos.y] = undefined;
}

// Functions accessible by server, mimic functions in here
module.exports = {
    generateWorld: function () {
        worldMap = generateMap();
    },
    getWorld: function () {
        return worldMap;
    },
    removeBlock: function(pos) {
        removeBlock(pos);
    },
    damageBlock: function(blockPos,playerHand) {
        return damageBlock(blockPos,playerHand);
    },
    getBlockID: function(blockPos) {
        return worldMap[blockPos.x][blockPos.y].blockID;
    },
    setBlock: function(blockid,pos) {
        setBlock(blockid,pos);
    },
    worldMapToStr: function() {
        return worldMapToStr(worldMap);
    },
    strToWorldMap: function(str) {
        return strToWorldMap(str);
    },
    loadWorld: function(world) {
        worldMap = strToWorldMap(world);
    }
}