function craftable(hasBench,returnAllRecipes) {
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
    var requiresWorkbench = 0;
    for (recipeID in recipes) {
        var cRecipe = recipes[recipeID];
        var cost = cRecipe.input;
        var canAfford = true;
        if (!returnAllRecipes) {
            for (var i = 0; i < cost.length; i++) {
                var cCost = cost[i];
                if (!items[cCost.id] || items[cCost.id] < cCost.count) {
                    canAfford = false;
                }
            }
        }
        if (canAfford) {
            if ((cRecipe.requiresBench && !hasBench) && !returnAllRecipes) {
                requiresWorkbench++;
            } else {
                craftableOut.push({id: recipeID, recipe: cRecipe});
            }
        }
    }
    return {craftable:craftableOut,uncraftable:requiresWorkbench};
}

function updateCraftable() {
    
    $("#allRecipesToggle span").html(allRecipesVisible ? "All Recipes" : "Craftable Recipes")
    
    var hasBench = false;
    var pPos = player.pos();
    var i = 0;
    for (var x = parseInt(pPos.x)-5; x < parseInt(pPos.x)+5; x++) {
        for (var y = parseInt(pPos.y)-5; y < parseInt(pPos.y)+5; y++) {
            if (worldMap && worldMap[x] && worldMap[x][y] && worldMap[x][y].blockID == 11) {
                if (player.lineOfSight(x,y)) {
                    hasBench = true;
                }
            }
        }
    }
    
    var craftableResults = craftable(hasBench,allRecipesVisible)
    var craftableItems = craftableResults.craftable;
    var uncraftableItems = craftableResults.uncraftable;

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
            var afford = true;
            // Costs
            var cost = cRecipe.input;
            for (var j = 0; j < cost.length; j++) {
                var cCost = cost[j];
                var hoverText = hoverName(cCost);
                if ((items[cCost.id]||0) >= cCost.count) {
                    cRecipeHTML += `<div title="${hoverText}" class="craftItem afford"><img src="images/${blocks[cCost.id].image}" /><span>${items[cCost.id]||0}/${cCost.count||1}</span></div>`;
                } else {
                    cRecipeHTML += `<div title="${hoverText}" class="craftItem"><img src="images/${blocks[cCost.id].image}" /><span>${items[cCost.id]||0}/${cCost.count||1}</span></div>`;
                    afford = false;
                }
            }
            if (cRecipe.requiresBench && !hasBench) {
                cRecipeHTML += `<div title="Work Bench" class="craftItem"><img src="images/${blocks[11].image}" /><span>&nbsp;</span></div>`;
                afford = false;
            } else if (cRecipe.requiresBench && hasBench) {
                cRecipeHTML += `<div title="Work Bench" class="craftItem afford"><img src="images/${blocks[11].image}" /><span>&nbsp;</span></div>`;
            }

            // Output
            var output = cRecipe.output;
            for (var j = 0; j < output.length; j++) {
                var cOutput = output[j];
                var hoverText = hoverName(cOutput);
                if (cOutput.isTool) {
                    cRecipeHTML += `<div title="${hoverText}"`;
                    if (!allRecipesVisible) {
                        cRecipeHTML += `onclick="craft(${craftableItems[i].id})"`;
                    }
                    cRecipeHTML += `class="craftItem craftReturn ${afford?"afford":""}"><img src="images/${toolImage(cOutput)}" /><span>${cOutput.count||1}</span></div>`;
                } else {
                    cRecipeHTML += `<div title="${hoverText}"`;
                    if (!allRecipesVisible) {
                        cRecipeHTML += `onclick="craft(${craftableItems[i].id})"`;
                    }
                    cRecipeHTML += `class="craftItem craftReturn ${afford?"afford":""}"><img src="images/${blocks[cOutput.id].image}" /><span>${cOutput.count}</span></div>`;
                }
            }

            cRecipeHTML += `</div>`;
            craftableHTML += cRecipeHTML;
        }
        if (uncraftableItems > 0) {
            craftableHTML += `<br /><h2>And ${uncraftableItems} More Items</h2><h5>Craft a work bench to see them!</h5>`
        }
        $("#crafting center").html(craftableHTML);
    }
}

function craft(recipeID) {
    var recipe = recipes[recipeID];
    
    var canAfford = false;
    var craftableItems = craftable().craftable;
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