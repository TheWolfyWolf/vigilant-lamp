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