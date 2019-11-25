import { getHeapSnapshot } from "v8";

// Main Mob Class


class Mobs {
    constructor(health, drops) {
        this.jumping = 0;
        this.sprite = createPlayer();
        this.hp = health
        this.itemDrops = drops
        
        window.setInterval(this.mobTick, 1000/50);
    }

    mobTick(){
        for (var key in otherPlayers.players) {
            var sprite = otherPlayers.players[key].sprite;
            var x = getPos(sprite).x-0.5;
            var y = getPos(sprite).y;
        }
        if(mobDistance(x,y)){
            //do something cool here
        }
        else{
            this.idleMove
        }
    }

    // Checks if a player has line of sight
    mobDistance(x,y) {
        
        var mobPos = getPos(this.sprite)
        // Works out distance to block
        var changeX = x - mobPos.x;
        var changeY = y - mobPos.y;
        var dist = Math.sqrt(changeX**2 + changeY**2);
        // If >5 then too
        if (dist > 10) {
            return false;
        }
        return true;
    }

    // Jumps
    jump() {
        var jumpHeight = 7;
        // Checks that the player isn't currently jumping and is on the floor
        if (this.jumping == 0 && this.floored) {
            this.jumping = jumpHeight/moveSpeed;
        }
    }
    
    // Move Left
    moveLeft() {
        if (this.sprite.x > 0) {
            if (this.sprite.scale.x > 0) this.sprite.scale.x *= -1;
            this.sprite.x -= blockSize * moveSpeed;
        }
    }
    // Move Right
    moveRight() {
        if (this.sprite.scale.x < 0) this.sprite.scale.x *= -1;
        this.sprite.x += blockSize * moveSpeed;
    }

    idleMove() {

    }
}

class Aggresive extends Mobs{
    constructor(health, drops, dmg){
        this.super(health, drops)
        this.damage = dmg
        
    }

}

class Passive extends Mobs{
    constructor(health, drops){
        this.super(health,drops)
    }
}