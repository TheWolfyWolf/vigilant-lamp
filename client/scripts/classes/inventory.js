// Inventory Item Class (for storing blocks)
class InventoryItem {
    constructor(itemID,count) {
        this.id = itemID;
        this.count = count || 1;
        this.stackable = true;
        this.isTool = false;
        this.img = "images/unknown.png";
        if (itemID > 0) {
            // Block
            this.img = `images/${blocks[itemID].image}`;
        }
    }
    
    toString() {
        return JSON.stringify({
            id: this.id,
            count: this.count,
            isTool: this.isTool
        });
    }
}

function hoverName(item) {
    if (item.isTool) {
        
        var toolStr = "";
        switch (item.tool) {
            case tools.axe:
                toolStr = "Axe";
                break;
            case tools.pickaxe:
                toolStr = "Pickaxe";
                break;
            case tools.shovel:
                toolStr = "Shovel";
                break;
        }
        
        var levelStr = "";
        switch (JSON.stringify(item.level)) {
            case JSON.stringify(toolLevels.wood):
                levelStr = "Wooden";
                break;
            case JSON.stringify(toolLevels.stone):
                levelStr = "Stone";
                break;
            case JSON.stringify(toolLevels.iron):
                levelStr = "Iron";
                break;
            case JSON.stringify(toolLevels.diamond):
                levelStr = "Diamond";
                break;
        }
        
        return `${levelStr} ${toolStr}`;
    } else {
        var id = item.id;
        return blocks[id].name;
    }
}

// Inventory Tool Class (for storing tools)
class Tool {
    constructor(toolID,toolLevel,durability) {
        this.tool = toolID;
        this.damage = toolLevel.damage;
        this.durability = durability || toolLevel.durability;
        this.level = toolLevel
        this.isTool = true;
        this.img = "images/" + toolImage(this);
    }
    
    toString() {
        return JSON.stringify({
            tool: this.tool,
            level: this.level,
            isTool: this.isTool,
            durability: this.durability
        });
    }
}
// Inventory Class, for storing players inventory
class Inventory {
    constructor(){
        this.inv = [];
        this.holding = 0;
        this.size = 15;
        for (var i =  0; i < this.size; i++){
            this.inv[i] = undefined;
        }
    }
    // Removes one item from a stack
    removeOne() {
        if (this.inv[this.holding] && this.inv[this.holding].stackable && this.inv[this.holding].count > 0) {
            this.inv[this.holding].count -= 1;
            if (this.inv[this.holding].count <= 0) {
                this.inv[this.holding] = undefined;
            }
        }
        updateInv();
    }
    toString() {
        var out = "";
        this.inv.forEach(function(item) {
            if (item) {
                out += "," + item.toString();
            } else {
                out += ",null";
            }
        });
        return "[" + out.substr(1,(out.length-1)) + "]";
    }
    
    loadInventory(invToLoad) {
        for (var i = 0; i < invToLoad.length; i++) {
            if (i < this.inv.length) {
                if (invToLoad[i]) {
                    if (invToLoad[i].isTool) {
                        this.inv[i] = new Tool(invToLoad[i].tool,invToLoad[i].level,invToLoad[i].durability);
                    } else {
                        this.inv[i] = new InventoryItem(invToLoad[i].id,invToLoad[i].count);
                    }
                }
            }
        }
    }
    
    swapItem(i1,i2) {
        var temp = this.inv[i1];
        this.inv[i1] = this.inv[i2];
        this.inv[i2] = temp;
    }
}