var width = 350;
var height = 50;

var trueChance = 0.4;
var numSteps = 6;
var birthLimit = 3;
var deathLimit = 4;

var seed = 12;

function doStep(map) {
  var newMap = [];
  for (var x = 0; x<map.length; x++) {
    var innerMap = [];
    for (var y = 0; y<map[0].length; y++) {
      var nbs = trueNeighbours(map,x,y);
      if (map[x][y]) {
        if (nbs < deathLimit) {
          innerMap[y] = 0;
          //console.log("1");
        } else {
          innerMap[y] = 1;
          //console.log("2");
        }
      } else {
        if (nbs > birthLimit) {
          innerMap[y] = 1;
          //console.log("3");
        } else {
          innerMap[y] = 0;
          //console.log("5");
        }
      }
      newMap[x] = innerMap;
    }
  }
  return newMap;
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
      } else if (map[neighbourX][neighbourY]) {
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
      for(var y = 0; y<h; y++){
          if ((Math.random()) < trueChance) {
              innerMap[y] = 1;
          } else {
            innerMap[y] = 0;
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
  var world = [];
  for (var i = 0; i < width; i++) {
    world[i] = map[i].concat(top[i]);
  }
    
  return world;
}

function generateTop(w,h) {
  var top = [];
  for (var x = 0; x < w; x++) {
    var topHeight = parseInt(getNoise(x,15));
    var innerTop = [];
    for (var y = 0; y < topHeight; y++) {
      innerTop[y] = 3;
      if (innerTop[y+1] == 0){
        innerTop[y] = 4;
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
