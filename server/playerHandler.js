class player {
    constructor(x,y){
        this.posx = x;
        this.posy = y;
    }

    getPlayerpos(){
        return getPos(this.sprite); 
    }

    getPlayerposX(){
        return getPos(this.sprite.x); 
    }

    getPlayerposY(){
        return getPos(this.sprite.y); 
    }
}

class players{
    constructor(){
        this.currentPlayers = [];
    }

    addPlayer(player){
        currentPlayers.push(player)
    }

    removePlayer(player){
        currentPlayer.forEach(i => {
            if (i == player){
                currentPlayers.splice(i)
            }
        });
    }

}