var recipes = {
    0: {
        input: [{id: 6, count: 1}],
        output: [{isTool: false,id: 10, count: 4}]
    },
    1: {
        input: [{id: 10, count: 5}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.wood}]
    },
    2: {
        input: [{id: 10, count: 5}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.wood}]
    },
    3: {
        input: [{id: 10, count: 3}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.wood}]
    },
    4: {
        input: [{id:10, count: 2},{id: 1, count: 1}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.stone}]
    },
    5: {
        input: [{id:10, count: 2},{id: 1, count: 3}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.stone}]
    },
    6: {
        input: [{id:10, count: 2},{id: 1, count: 3}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.stone}]
    }
}

function craftable() {
    var inv = player.inventory.inv;
    
    var items = {};
    for (var i = 0; i < inv.length; i++) {
        if (inv[i] && !inv[i].isTool) {
            if (!(inv[i].id in items)) {
                items[inv[i].id] = 0;
            }
            items[inv[i].id] += inv[i].count;
        }
    }
    
    var craftableOut = [];
    for (recipeID in recipes) {
        var cRecipe = recipes[recipeID];
        var cost = cRecipe.input;
        var canAfford = true;
        for (var i = 0; i < cost.length; i++) {
            var cCost = cost[i];
            if (!items[cCost.id] || items[cCost.id] < cCost.count) {
                canAfford = false;
            }
        }
        if (canAfford) {
            craftableOut.push({id: recipeID, recipe: cRecipe});
        }
    }
    return craftableOut;
}

function updateCraftable() {
    var craftableItems = craftable();

    /*
    <div class="craftRow">
        <div class="craftItem"><img /><span>0</span></div>
        <div class="craftItem"><img /><span>0</span></div>
        <div class="craftItem"><img /><span>0</span></div>
        <div class="craftItem"><img /><span>0</span></div>
        <div class="craftItem"><img /><span>0</span></div>
    </div>
    */
    
    var inv = player.inventory.inv;
    
    var items = {};
    for (var i = 0; i < inv.length; i++) {
        if (inv[i] && !inv[i].isTool) {
            if (!(inv[i].id in items)) {
                items[inv[i].id] = 0;
            }
            items[inv[i].id] += inv[i].count;
        }
    }
    
    if (craftableItems.length == 0) {
        $("#crafting center").html("<h2>No Craftable Items</h2><h5>Try collecting more resources</h5>");
    } else {
        var craftableHTML = "";
        for (var i = 0; i < craftableItems.length; i++) {
            var cRecipeHTML = `<div class="craftRow">`;

            var cRecipe = craftableItems[i].recipe;
            // Costs
            var cost = cRecipe.input;
            for (var j = 0; j < cost.length; j++) {
                var cCost = cost[j];
                var hoverText = hoverName(cCost);
                cRecipeHTML += `<div title="${hoverText}" class="craftItem"><img src="images/${blocks[cCost.id].image}" /><span>${items[cCost.id]}/${cCost.count||1}</span></div>`;
            }

            // Output
            var output = cRecipe.output;
            for (var j = 0; j < output.length; j++) {
                var cOutput = output[j];
                var hoverText = hoverName(cOutput);
                if (cOutput.isTool) {

                    cRecipeHTML += `<div title="${hoverText}" onclick="craft(${craftableItems[i].id})" class="craftItem craftReturn"><img src="images/${toolImage(cOutput)}" /><span>${cOutput.count||1}</span></div>`;
                } else {
                    cRecipeHTML += `<div title="${hoverText}" onclick="craft(${craftableItems[i].id})" class="craftItem craftReturn"><img src="images/${blocks[cOutput.id].image}" /><span>${cOutput.count}</span></div>`;
                }
            }

            cRecipeHTML += `</div>`;
            craftableHTML += cRecipeHTML;
        }

        $("#crafting center").html(craftableHTML);
    }
}

function craft(recipeID) {
    var recipe = recipes[recipeID];
    
    var canAfford = false;
    var craftableItems = craftable();
    for (var i = 0; i < craftableItems.length; i++) {
        if (craftableItems[i].id == recipeID) {
            canAfford = true;
        }
    }
    if (!canAfford) {
        return false;
    }
    
    var cost = recipe.input;
    for (var i = 0; i < cost.length; i++) {
        var cCost = cost[i];
        var cID = cCost.id;
        var cCount = cCost.count;
        for (var j = 0; j < player.inventory.inv.length; j++) {
            if (player.inventory.inv[j] && !player.inventory.inv[j].isTool && player.inventory.inv[j].id == cID) {
                player.inventory.inv[j].count -= cCount;
                if (player.inventory.inv[j].count <= 0) {
                    player.inventory.inv[j] = undefined;
                }
                break;
            }
        }
    }
    
    var output = recipe.output;
    for (var i = 0; i < output.length; i++) {
        var cOut = output[i];
        if (cOut.isTool) {
            player.giveTool(cOut.tool,cOut.level);
        } else {
            player.giveItem(cOut.id,cOut.count);
        }
    }
    
    updateCraftable();
    player.updateHotBar();
}