
// ENUM for tools
const tools = {
    pickaxe: 1,
    axe: 2,
    shovel: 3
}

// ENUM for tool levels
const toolLevels = {
    none: 0,
    wood: {durability: 50,damage: 1},
    stone: {durability: 100,damage: 2},
    iron: {durability: 220,damage: 3},
    diamond: {durability: 500,damage: 4}
}

/* From Crafting.js */
var recipes = {
    0: {
        input: [{id: 6, count: 1}],
        output: [{isTool: false,id: 10, count: 4}]
    },
    1: {
        input: [{id: 14, count: 2},{id: 10, count: 3}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.wood}],
        requiresBench: true
    },
    2: {
        input: [{id: 14, count: 2},{id: 10, count: 3}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.wood}],
        requiresBench: true
    },
    3: {
        input: [{id: 14, count: 2},{id: 10, count: 1}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.wood}],
        requiresBench: true
    },
    4: {
        input: [{id:14, count: 2},{id: 1, count: 1}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.stone}],
        requiresBench: true
    },
    5: {
        input: [{id:14, count: 2},{id: 1, count: 3}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.stone}],
        requiresBench: true
    },
    6: {
        input: [{id:14, count: 2},{id: 1, count: 3}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.stone}],
        requiresBench: true
    },
    7: {
        input: [{id:14, count: 2},{id: 8, count: 1}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.iron}],
        requiresBench: true
    },
    8: {
        input: [{id:14, count: 2},{id: 8, count: 3}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.iron}],
        requiresBench: true
    },
    9: {
        input: [{id:14, count: 2},{id: 8, count: 3}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.iron}],
        requiresBench: true
    },
    10: {
        input: [{id:14, count: 2},{id: 9, count: 1}],
        output: [{isTool: true,tool:tools.shovel,level:toolLevels.diamond}],
        requiresBench: true
    },
    11: {
        input: [{id:14, count: 2},{id: 9, count: 3}],
        output: [{isTool: true,tool:tools.axe,level:toolLevels.diamond}],
        requiresBench: true
    },
    12: {
        input: [{id:14, count: 2},{id: 9, count: 3}],
        output: [{isTool: true,tool:tools.pickaxe,level:toolLevels.diamond}],
        requiresBench: true
    },
    13: {
        input: [{id:10, count: 4}],
        output: [{isTool: false,id:11,count:1}],
        requiresBench: false
    },
    14: {
        input: [{id:10, count: 6},{id:8,count:3},{id:9,count:2}],
        output: [{isTool:false,id:12,count:2}],
        requiresBench: true
    },
    15: {
        input: [{id:10, count: 4},{id:14, count: 2},{id:8,count:2},{id:9,count:1}],
        output: [{isTool:false,id:13,count:1}],
        requiresBench: true
    },
    16: {
        input: [{id:10, count: 2}],
        output: [{isTool:false,id:14,count:4}],
        requiresBench: false
    },
    17: {
        input: [{id:14, count: 2},{id:7,count:1}],
        output: [{isTool:false,id:15,count:1}],
        requiresBench: false
    },
    18: {
        input: [{id:7, count: 4}],
        output: [{isTool:false,id:16,count:3}],
        requiresBench: false
    }
}

// Dict to handle all block info
/*
    Stores:
        - Image
        - Hardness
        - (Ideal) tool
        - Min Tool
        - customPlace (optional, custom place function)
        - removeOnPlace (optional, bool to remove on place)
*/
const blocks = {
    1: {image:"stone.png",hardness:10, tool:tools.pickaxe, minTool:toolLevels.wood,name:"Stone"}, 
    2: {image:"stoneBackground.jpg", hardness:10, tool:tools.pickaxe, minTool:toolLevels.stone,name:"Stone Background"},
    3: {image:"dirt.png",hardness:4, tool:tools.shovel, minTool:toolLevels.none,name:"Dirt"}, 
    4: {image:"grass.png",hardness:5, tool:tools.shovel, minTool: toolLevels.none,name:"Grass"}, 
    5: {image:"bedrock.png",hardness:-1,name:"Bedrock"}, 
    6: {image:"wood.png",hardness:8,tool:tools.axe, minTool:toolLevels.none,name:"Wood"}, 
    7: {image:"leaf.png",hardness:1,tool:tools.axe, minTool:toolLevels.none,name:"Leaf"}, 
    8: {image:"iron.png",hardness:20,tool:tools.pickaxe, minTool:toolLevels.stone,name:"Iron"}, 
    9: {image:"diamond.png",hardness:30,tool:tools.pickaxe, minTool:toolLevels.iron,name:"Diamond"}, 
    10: {image:"planks.png",hardness:5,tool:tools.axe, minTool:toolLevels.none,name:"Wood Planks"}, 
    11: {image:"bench.png",hardness:5,tool:tools.axe, minTool:toolLevels.none,name:"Work Bench"}, 
    12: {image:"spawnChanger.png",hardness:-1,tool:tools.axe, minTool:toolLevels.none,name:"Spawn Changer",customPlace:function() {
            player.setSpawn(player.pos().x,player.pos().y);
            errorMessage(`Your spawn is set to x:${player.spawnx} y:${player.spawny}`);
            $("#gameOuter").addClass("unreadMessage");
        }},
    13: {image:"clock.png",hardness:-1,tool:tools.axe, minTool:toolLevels.none,name:"Clock",customPlace:function() {
            errorMessage(`The time is ${new Date(parseInt((time/999)*86400)*1000).toLocaleTimeString()}`);
            $("#gameOuter").addClass("unreadMessage");
        },removeOnPlace:false,requiresSight:false},
    14: {image:"stick.png",hardness:-1,tool:tools.axe, minTool:toolLevels.none,name:"Stick",customPlace:function() {},removeOnPlace:false},
    15: {image:"torch.png",hardness:1,tool:tools.axe, minTool:toolLevels.none,name:"Torch",customPlace:function() {},removeOnPlace:false},
    16: {image:"apple.png",hardness:-1,tool:tools.axe, minTool:toolLevels.none,name:"Apple",customPlace:function() {
            player.heal(1);
        },requiresSight:false}
}

const nonSolidBlocks = [0,2,15];

(function(exports){
    exports.blocks = blocks;
    exports.tools = tools;
    exports.toolLevels = toolLevels;
    exports.recipes = recipes;
    exports.nonSolidBlocks = nonSolidBlocks;
}(typeof exports === 'undefined' ? this.data = {} : exports));