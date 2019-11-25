// Class to store a players x and y position
class Player {
    constructor(){
        this.posx = undefined;
        this.posy = undefined;
    }
    // Get position
    getPos() {
        return {x: this.posx, y: this.posy}
    }
    // Set position
    setPos(x,y) {
        this.posx = x;
        this.posy = y;
    }
}

// Class to store players
class Players{
    constructor(){
        this.currentPlayers = {};
    }
    
    // Set a players location for specific ID
    setPlayerLocation(id,x,y) {
        if (id in this.currentPlayers) {
            this.currentPlayers[id].setPos(x,y);
        } else {
            this.addPlayer(id,x,y);
        }
    }

    // Add a player with id
    addPlayer(id,x,y){
        this.currentPlayers[id] = new Player()
    }
    // Remove a player with id
    removePlayer(id){
        delete this.currentPlayers[id];
    }

}
// Create a players global
players = new Players();

// Functions accessible by server, mimic functions in here
module.exports = {
    addPlayer: function (id) {
        players.addPlayer(id);
    },
    removePlayer: function(player) {
        players.removePlayer(player);
    },
    updatePos: function(id,x,y) {
        players.setPlayerLocation(id,x,y);
    }
}