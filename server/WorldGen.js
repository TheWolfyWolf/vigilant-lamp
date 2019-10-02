var width = 200;
var height = 50;

var trueChance = 0.4;
var numSteps = 6;
var birthLimit = 3;
var deathLimit = 4;

var seed = 12;

function showInTable(map) {
  for (var x = 0; x<map.length; x++) {
    var innerMap = map[x];
    for (var y = 0; y<innerMap.length; y++) {
      $("#" + x + "" + y).removeClass('black').removeClass('red');
      var idx = String('0000' + x).slice(-4);
      var idy = String('0000' + y).slice(-4);
      var id = "#" + idx + idy;
      if (id == "#00000000") {
        console.log(innerMap[y]);
      }
      if (innerMap[y]) {
        $(id).addClass('black');
      } else {
        $(id).addClass('red');
      }
    }
  }
}

function doStep(map) {
  var newMap = [];
  for (var x = 0; x<map.length; x++) {
    var innerMap = [];
    for (var y = 0; y<map[0].length; y++) {
      var nbs = trueNeighbours(map,x,y);
      if (map[x][y]) {
        if (nbs < deathLimit) {
          innerMap[y] = false;
          //console.log("1");
        } else {
          innerMap[y] = true;
          //console.log("2");
        }
      } else {
        if (nbs > birthLimit) {
          innerMap[y] = true;
          //console.log("3");
        } else {
          innerMap[y] = false;
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

function initialiseMap() {
  var map = [];
  for(var x = 0; x<width; x++){
    innerMap = []
      for(var y = 0; y<height; y++){
          if ((Math.random()) < trueChance) {
              innerMap[y] = true;
          } else {
            innerMap[y] = false;
          }
      }
      map[x] = innerMap;
  }
  return map;
}

function generateMap() {
  var map = initialiseMap();
  for (var i = 0; i < numSteps; i++) {
    map = doStep(map);
    //console.log("wagwan");
  }
  buildWorld(map);
  createPlayer(50,51);
  return map;
}

var mapp = generateMap();
//console.log(mapp);
//showInTable(mapp);
