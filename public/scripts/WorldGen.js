var width = 2;
var height = 1;

const nonSolidBlocks = [0,2];

function worldMapToStr(mapToUse) {
    var out = "";
    mapToUse.forEach(function(column) {
        out += ",[";
        var innerOut = "";
        column.forEach(function(row) {
            innerOut += "," + row.toString();
        });
        out += innerOut.substr(1,innerOut.length-1);
        out += "]";
    });
    return "[" + out.substr(1,out.length-1) + "]";
}

function strToWorldMap(mapToUse) {
    //console.log(mapToUse);
    //mapToUse = JSON.parse(mapToUse);
    mapToUse.forEach(function(column) {
        for (var i = 0; i<column.length; i++) {
            row = column[i];
            if (row) {
                column[i] = new blockObject(row.x,row.y,row.blockID,row.damage);
            }
        }
    });
    return mapToUse;
}

class blockObject {
    constructor(x,y,block,damage) {
        this.x = x;
        this.y = y;
        this.blockID = block;
        this.sprite = undefined;
        this.damage = damage || 0;
    }
    
    solid() {
        for (var i = 0; i < nonSolidBlocks.length; i++) {
            if (nonSolidBlocks[i] == this.blockID) {
                return false;
            }
        }
        return true;
    }
    
    destroy() {
        blocksContainer.removeChild(this.sprite);
        console.log(this.x);
        console.log(this.y);
        worldMap[this.x][this.y] = undefined;
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
    
    toString() {
        return JSON.stringify({
            x: this.x,
            y: this.y,
            id: this.blockID,
            damage: this.damage
        });
    }
}