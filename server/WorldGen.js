var width = 10;
var height = 10;

var map = [width][height];
var trueChance = 0.45;

for(var x = 0; x<width; x++){
    for(var y = 0; y<height; y++){
        if((Math.random) < trueChance){
            map[x][y] = true;
        }
    }
}

function doStep(){

}

function trueNeighbours(map, x, y){

}