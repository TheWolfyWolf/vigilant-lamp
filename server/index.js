/*
    FUNCTIONS
    FUNCTIONS
    FUNCTIONS
*/

// Function to check if log in information is valid
function checkLogin(user,pass,callback) {
    // Is user or pass are blank, instant fail
    if (user == "" || pass == "") {
        callback(false);
    }
    // Connect to the DB
    var userdb = new sqlite3.Database('dbs/users.db');
 
    // SQL to get users where email/username is the same as the entered username
    var sql = "SELECT `userid`,`username`,`password`,`salt`,`email` FROM `users` WHERE `username`='" + user + "' OR `email`='" + user + "';";

    // Execute the sql
    userdb.all(sql, function(err,rows) {
        // Error => failed to log in
        if (err) {
            callback(false);
        } else {
            var loggedIn = false;
            var userReturn = undefined;
            // Go thru each result 
            rows.forEach(function(row) {
                // Hash the password entered using the salt of the current user
                var hashedPass = hashStr(pass,row.salt);
                // Check that username matches the rows username/email
                // and the newly hashed password matches the rows apssword
                if ((row.username == user || row.email == user) && row.password == hashedPass) {
                    // Logs the user in
                    console.log("User " + user + " logged in");
                    loggedIn = true;
                    userReturn = row;
                }
            });
            // Closes the database
            userdb.close();
            console.log(userReturn);
            // Calls the callback passing the user information
            callback(loggedIn,userReturn);
        }
    });
}

// Function to save the world
function saveWorld() {
    // Connect to the database
    let userdb = new sqlite3.Database('dbs/users.db');
 
    // Create SQL statement using the world, once converted to a string
    let sql = "INSERT INTO `saves` (`world`) VALUES ('" + world.worldMapToStr() + "')";
    // Execute SQL
    console.log(userdb.run(sql));
    console.log("World Saved");
    
    // Delete old world saves, keeping newest 5
    // Gets the latest saves saveid
    sql = "SELECT `saveid` FROM `saves` ORDER BY `saveid` DESC LIMIT 1";
    userdb.all(sql, function(err,rows) {
        if (rows.length >= 1) {
            rows.forEach(function(row) {
                // Deletes all saves with a saveid less than the newest saveid-5
                sql = "DELETE FROM `saves` WHERE `saveid`<" + (row.saveid-5) + ";";
                console.log(sql);
                console.log(userdb.run(sql));

                console.log("Deleted Old Saves");
            });
        }
        // close the database connection
        userdb.close();
        
        // Calls the function back after desired amount of time
        seconds = 1000;
        minutes = seconds * 60;
        hours = minutes * 60;
        setTimeout(saveWorld, 15 * minutes);
    });
}

// Function to loadworld
function loadWorld(callback) {
    // Connect to the database
    let userdb = new sqlite3.Database('dbs/users.db');
    // SQL to get newest save
    let sql = "SELECT `saveid`,`world` FROM `saves` ORDER BY `saveid` DESC LIMIT 1";
    
    // Executes sql
    userdb.all(sql, function(err,rows) {
        // err => make new world
        if (err) {
            console.log("Making New");
            console.log(err);
            world.generateWorld();
            callback();
        } else {
            console.log("Loaded World");
            var loggedIn = false;
            var userReturn = undefined;
            // If some kind of problem, generate new world
            if (rows.length != 1) {
                world.generateWorld();
            } else {
                // Load world
                rows.forEach(function(row) {
                    world.loadWorld(row.world);
                });
            }
            // close database
            userdb.close();
            callback();
        }
    });
}

// Function to save a users position in the database
function saveUserPosition(userid,x,y) {
    let userdb = new sqlite3.Database('dbs/users.db');
    let sql = "UPDATE `users` SET `lastx`='" + x + "',`lasty`='" + y + "' WHERE `userid`='" + userid + "';";
    userdb.run(sql)
}

// Function to get a players info from userid
function getPlayerInfo(userid,callback) {
    let userdb = new sqlite3.Database('dbs/users.db');
    let sql = "SELECT `inventory`,`spawnx`,`spawny`,`health`,`lastx`,`lasty` FROM `users` WHERE `userid`='" + userid + "';";
    userdb.all(sql, function(err,rows) {
        if (err) {
            callback(false);
            userdb.close();
        } else {
            if (rows.length != 1) {
                callback(false);
                userdb.close();
            } else {
                var playerInfo = undefined;
                rows.forEach(function(row) {
                    playerInfo = row;
                });
                userdb.close();
                callback(playerInfo);
            }
        }
    });
}

// Function to generate a random string of length (for creating a users salt)
function randomStr(length) {
    var out = "";
    var chars = "1234567890AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
    for (var i = 0; i<length; i++) {
        // Add random character from chars to output
        out += chars[Math.round(Math.random()*chars.length)];
    }
    return out;
}

// Function to hash using a salt
function hashStr(str,salt) {
    var crypto = require('crypto');
    var hash = crypto.createHash('md5').update(str+salt).digest('hex');
    return hash;
}

// Function to create a new user
function createUser(username,password,email) {
    let userdb = new sqlite3.Database('dbs/users.db');
    
    var salt = randomStr((Math.random()*50)+10);
    
    var hash = hashStr(password,salt);
 
    let sql = "INSERT INTO `users` (`username`,`password`,`email`,`salt`) VALUES ('" + username + "','" + hash  + "','" + email + "','" + salt + "')";
    console.log(userdb.run(sql));
    // close the database connection
    userdb.close();
    return true;
}

// Function to create the databases
function createDB() {
    var userdb = new sqlite3.Database("dbs/users.db",  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,function(err) {/* Error Code */});
    
    var sql = `CREATE TABLE IF NOT EXISTS "users" (
                "userid"	INTEGER PRIMARY KEY AUTOINCREMENT,
                "username"	TEXT NOT NULL,
                "password"	TEXT NOT NULL,
                "email"	TEXT NOT NULL,
                "salt"	TEXT
            );`;
    userdb.run(sql)
    sql = `CREATE TABLE IF NOT EXISTS "saves" (
                "saveid"	INTEGER PRIMARY KEY AUTOINCREMENT,
                "world"	TEXT NOT NULL
            );`;
    userdb.run(sql)
    userdb.close();
    return true;
}

/*
    END OF FUNCTIONS
    END OF FUNCTIONS
    END OF FUNCTIONS
*/

// Node Modules
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const sqlite3 = require('sqlite3').verbose();

// Custom Modules
var world = require('./worldHandler');
var player = require('./playerHandler');

// Gets a root directory, useful for pointing to files/directories
resolve = require('path').resolve;
rootDir = resolve('../');

// Use
app.use('/scripts', express.static(rootDir + '/public/scripts'));
app.use('/images', express.static(rootDir + '/public/images'));
app.use(express.static(rootDir + '/public'));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

// Handle Shutdown
process.on ('SIGINT',() => {
    saveWorld();
    console.log("SHUTTING DOWN");
    process.exit(1);
});

// Create databases
var dbCreate = createDB();
if (!dbCreate) {
    // If failed to create, throw an error
    throw new Error("Couldn't access/create users.db");
}

// Set userid default
var userid = -1;

/*
    Handling sending pages to user
    Handling sending pages to user
    Handling sending pages to user
*/

// Post request sent to /game
app.post('/game', function(req, res) {
    // Check the user is logged in, if not then redirect them to login page
    checkLogin(req.body.user,req.body.pass,function(loggedIn,user) {
        if (loggedIn) {
            console.log(`loggedIn: ${loggedIn}`);
            res.sendFile(rootDir + '/public/game.html');
            userid = user.userid;
            
        } else {
            console.log(`failedLogIn: ${loggedIn}`);
            res.sendFile(rootDir + '/public/login.html');
        }
    });
});
// Get request sent to /login or / or /signup or /game
// Redirect user to login (and signup) page
app.get(['/login','/','/signup','/game'], function(req, res){
    console.log(req._parsedUrl.pathname);
    console.log("@Login.html");
    res.sendFile(rootDir + '/public/login.html');
});
// Handles a post request sent to signupHandle
app.post('/signupHandle', function(req,res) {
    // If successfully created user redirect to login
    if (createUser(req.body.user,req.body.pass,req.body.email)) {
        res.writeHead(302, {'Location':'login'});
        res.end();
    } else {
        // Otherwise redirect to signup (altho both same file now, need to add some sort of notif to user)
        res.writeHead(302, {'Location':'signup'});
        res.end();
    }
})

// Generate, then save the world
loadWorld(function() {
    saveWorld();
});

// Handle sockets
io.on('connection', function(socket){
    // Stores users id in the socket
    socket.userid = userid;
    console.log(`userid ${socket.userid} connected`);
    // If userid = -1 (something went wrong), disconnect socket
    if (socket.userid == -1) {
        socket.disconnect();
    }
    // Add the new user to the players list
    player.addPlayer(socket.userid);
    
    // On user disconnect
    socket.on('disconnect', function() {
        console.log(`userid ${socket.userid} disconnected`);
        // Remove player from players lists
        player.removePlayer(socket.userid);
        // Tells all sockets that the player left
        socket.broadcast.emit("playerLeave",socket.userid);
        
        // Work out all active players and tell all active players who is active
        var allPlayers = [];
        Object.keys(io.sockets.sockets).forEach(function(id) {
            if (io.sockets.sockets[id].userid != socket.userid) {
                allPlayers.push(io.sockets.sockets[id].userid);
            }
        });
        socket.broadcast.emit("allActivePlayers",allPlayers);
    });
    
    // On player location update
    socket.on('playerLocation', function(pos) {
        // Update players location in players list
        player.updatePos(socket.userid,pos.x,pos.y);
        // Tell all players where this player is
        socket.broadcast.emit("playerLocation",{id: socket.userid,pos:pos});
        // Save players location
        saveUserPosition(socket.userid,pos.x,pos.y);
    });
    
    // On client requesting a world
    socket.on('worldRequest', function(msg){
        // Send them back the world converted to a string
        socket.emit("currentWorld",world.worldMapToStr());
    });
    
    // On client requesting their player info
    socket.on('playerRequest', function(msg){
        // Return their player info
        getPlayerInfo(socket.userid, function(info) {
            if (info) {
                socket.emit("currentPlayer",info);
            }
        });
    });
    
    // On client informing a block is broken
    socket.on('blockDeleted', function(pos){
        // Tell all users a block is broken
        io.emit("blockDeleted",pos);
        
        // Remove the block
        world.removeBlock(pos);
        //io.emit("currentWorld",world.getWorld());
    });
    
    // On client informing a block is placed
    socket.on('blockPlaced', function(info){
        // Tell all users a block is place
        io.emit("blockPlaced",{blockid:info.blockid,pos:info.pos});
        
        // Place the block
        world.setBlock(info.blockid,info.pos);
        //io.emit("currentWorld",world.getWorld());
    });
    
    // On client informing a block is damage
    socket.on('damageBlock', function(data) {
        var blockPos = data.blockPos;
        var playerHand = data.playerHand;
        // Damage the block
        var damageBlock = world.damageBlock(blockPos,playerHand);
        /*
            damageBlock =>  0 = not broken
                            1 = broken but not right tool
                            2 = broken with correct tool, drop loot
        */
        if (damageBlock != 0) {
            if (damageBlock == 2) {
                // Tell the user they broke the block, and should get the loot
                socket.emit("blockBroken", world.getBlockID(blockPos));
            }
            // Tell every client the block has been deleted
            io.emit("blockDeleted",blockPos);
            // Remove the block
            world.removeBlock(blockPos);
        }
        
    });
    
    // IMPLEMENT MESSAGING
    socket.on('messageSent', function(msg){
        io.emit("messageRecieve",msg);
    });
    
    // Handle client requesting a ping
    socket.on('pingSend', function(startTime){
        // Send them a ping return
        socket.emit("pingReturn",`${startTime}`);
    });
});

// Listen on port 80 (HTTP port)
http.listen(80, function(){
  console.log('listening on *:80');
});