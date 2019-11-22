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