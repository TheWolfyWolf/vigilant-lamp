var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var world = require('./worldHandler');

resolve = require('path').resolve;
rootDir = resolve('../');



app.use('/scripts', express.static(rootDir + '/public/scripts'));
app.use('/images', express.static(rootDir + '/public/images'));
app.use(express.static(rootDir + '/public'));

// Send Content
app.get('/', function(req, res){
    console.log(req._parsedUrl.pathname);
    res.sendFile(rootDir + '/public/game.html');
});

world.generateWorld();

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('worldRequest', function(msg){
        socket.emit("currentWorld",world.getWorld());
    });
    socket.on('blockDeleted', function(pos){
        io.emit("blockDeleted",pos);
        world.removeBlock(pos);
        //io.emit("currentWorld",world.getWorld());
    });
    socket.on('damageBlock', function(data) {
        blockPos = data.blockPos;
        playerHand = data.playerHand;
        if (world.damageBlock(blockPos,playerHand) == true) {
            io.emit("blockDeleted",blockPos);
            world.removeBlock(blockPos);
        }
        
    });
    socket.on('messageSent', function(msg){
        io.emit("messageRecieve",msg);
    });
    socket.on('pingSend', function(startTime){
        socket.emit("pingReturn",`${startTime}`);
    });
});

http.listen(80, function(){
  console.log('listening on *:3000');
});