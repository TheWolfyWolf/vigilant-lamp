var express = require('express');
var app = express();

//creates the server connection
var server = app.listen(3000, () => {
    console.log('server is running on port', server.address().port);
   });

   app.use(express.static(__dirname));

   //makes the connection to the database of messages from users
   var mongoose = require('mongoose');
   var dbUrl = 'https://cloud.mongodb.com/v2/5d98d90ca6f23936842d9eb5#metrics/replicaSet/5d98d9a879358e851d5b0563/explorer/in-game-chat/messages/find'
   mongoose.connect(dbUrl , (err) => { 
    console.log('mongodb connected',err);
 })
 var Message = mongoose.model('Message',{ name : String, message : String})

 //body parser so the messages can be extracted 
 var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//this function retrives the messages from the database
app.get('/messages', (req, res) => {
    Message.find({},(err, messages)=> {
      res.send(messages);
    })
  })
//once the messages are pulled from the database they are then pushed to the server and posted
app.post('/messages', (req, res) => {
    var message = new Message(req.body);
    message.save((err) =>{
      if(err)
        sendStatus(500);
      io.emit('message', req.body);
      res.sendStatus(200);
    })
  })


  //the socket.io is used to allow real time commuication between the web-client and the server 
var http = require('http').Server(app);
var io = require('socket.io')(http);

//shows new connection of a new user to server
io.on('connection', () =>{
    console.log('a user is connected')
   })