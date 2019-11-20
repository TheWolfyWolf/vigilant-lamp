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

// Block Object
class blockObject {
    constructor(x,y,block,damage) {
        this.x = x;
        this.y = y;
        this.blockID = block;
        this.sprite = createBlock(x,y,block);
        this.damage = damage || 0;
    }
    
    // Function to tell if block is solid or not
    solid() {
        for (var i = 0; i < nonSolidBlocks.length; i++) {
            if (nonSolidBlocks[i] == this.blockID) {
                return false;
            }
        }
        return true;
    }
    
    // Destroys Block
    destroy() {
        blocksContainer.removeChild(this.sprite);
        worldMap[this.x][this.y] = undefined;
    }
    
    // Gets blocks hardness
    hardness() {
        return blocks[this.blockID].hardness;
    }
    
    // Unloads block
    unload() {
        if (this.sprite != undefined) {
            this.sprite.visible = false;
        }
    }
    // Loads block
    load() {
        if (this.sprite != undefined) {
            this.sprite.visible = true;
            this.sprite.x = this.x*blockSize;
            this.sprite.y = app.screen.height - this.y*blockSize;
            this.sprite.tint = blocksTint;
        }
    }
    
    // Gets whether block is visible or not
    visible() {
        if (this.sprite != undefined) {
            return this.sprite.visible;
        }
        return false;
    }
    
    // Toggles blocks visibility
    toggleVisible() {
        if (this.sprite != undefined) {
            this.sprite.visible = !this.sprite.visible;
        }
    }
    
    // Drops loot from the block
    dropLoot() {
        if (player.freeInventorySpace(this.blockID) > 1) {
            var itemToGive = this.blockID;
            
            /*
                Write custom drops here
                Write custom drops here
                Write custom drops here
            */
            switch (this.blockID) {
                case 4:
                    itemToGive = 3;
                    break;
            }
            
            player.giveItem(itemToGive);
        }
    }
    
    // Convert a block to a string (a JSON dict container its x, y, id, and current damage)
    toString() {
        return JSON.stringify({
            x: this.x,
            y: this.y,
            id: this.blockID,
            damage: this.damage
        });
    }
}