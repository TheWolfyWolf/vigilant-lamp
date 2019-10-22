var width = 1000;
var height = 200;

const nonSolidBlocks = [0,2];

class blockObject {
    constructor(x,y,block) {
        this.x = x;
        this.y = y;
        this.blockID = block;
        this.sprite = undefined;
        this.damage = 0;
    }
    
    solid() {
        for (var i = 0; i < nonSolidBlocks.length; i++) {
            if (nonSolidBlocks[i] == this.blockID) {
                return false;
            }
        }
        return true;
    }
    
    hardness() {
        return blocks[this.blockID].hardness;
    }
    
    unload() {
        if (this.sprite != undefined) {
            this.sprite.visible = false;
        }
    }
    load() {
        if (this.sprite != undefined) {
            this.sprite.visible = true;
        }
    }
    
    visible() {
        if (this.sprite != undefined) {
            return this.sprite.visible;
        }
        return false;
    }
    
    toggleVisible() {
        if (this.sprite != undefined) {
            this.sprite.visible = !this.sprite.visible;
        }
    }
    
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
    
}

var trueChance = 0.4;
var numSteps = 5;
var birthLimit = 4;
var deathLimit = 2;

var seed = 12;

function doStep(map) {
    for (var x = 0; x<map.length; x++) {
        for (var y = 0; y<map[0].length; y++) {
            var nbs = trueNeighbours(map,x,y);
            if (map[x][y].blockID) {
                if (nbs < deathLimit) {
                    map[x][y].blockID = 0;
                    //console.log("1");
                } else {
                    map[x][y].blockID = 1;
                    //console.log("2");
                }
            } else {
                if (nbs > birthLimit) {
                    map[x][y].blockID = 1;
                    //console.log("3");
                } else {
                    map[x][y].blockID = 0;
                    //console.log("5");
                }
            }
        }
    }
    return map;
}

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
  //console.log(`Count is ${count}`);
}

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

function generateMap() {
    /* Cave Area */
    var map = initialiseMap(width, height*.8);
    for (var i = 0; i < numSteps; i++) {
        map = doStep(map);
    }
    

    /* Top Ground */
    var top = generateTop(width,height*.2);

    // Merge
    var world = [];
    for (var i = 0; i < width; i++) {
        if (map[i] != undefined && top[i] != undefined) {
            world[i] = map[i].concat(top[i]);
        }
    }
    
    // Create bedrock
    for (var x = 0; x < world.length; x++) {
        world[x][0] = new blockObject(x,0,5);
    }

    return world;
}

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


/* TEST */
var seed = 42069;

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

function random(x, range) {
    return parseInt(((x + seed) ^ 10) % range);
}
