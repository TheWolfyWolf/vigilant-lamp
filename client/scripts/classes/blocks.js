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
            
            var timeOffMidday = Math.abs(time-500);
            var daylightPercent = (1-timeOffMidday/500);
            
            if (player.inventory.inv[player.inventory.holding] && player.inventory.inv[player.inventory.holding].id == 15) {
                var changeX = player.pos().x-this.x;
                var changeY = player.pos().y-this.y;
                var dist = Math.sqrt(changeX**2 + changeY**2);
                if (1/((dist||1)/4) > daylightPercent) daylightPercent = 1/((dist||1)/4);
            }
            for (var pId in otherPlayers.players) {
                console.log(`torch: ${otherPlayers.players[pId].hasTorch}`);
                if (otherPlayers.players[pId].hasTorch) {
                    var playerPos = getPos(otherPlayers.players[pId].sprite);
                    playerPos.x -= 0.5;
                    var changeX = playerPos.x-this.x;
                    var changeY = playerPos.y-this.y;
                    var dist = Math.sqrt(changeX**2 + changeY**2);
                    if (1/((dist||1)/4) > daylightPercent) daylightPercent = 1/((dist||1)/4);
                }
            }
            this.sprite.tint = createColor({r:255,g:255,b:255},(daylightPercent+.3)/2);
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