//start of creating the databse connection
var mysql = require('mysql');


var con = mysql.createConnection({
  connectionLimit: 50,
  host: "sql2.freesqldatabase.com",
  user: "sql2309161",
  password: "rA7%lV2!",
  database: "sql2309161"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
//creates he tables in the mysql database
  var sql = "CREATE TABLE messages (name VARCHAR(255), message VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});

//end

//start of CONNECTION SERVER
var express = require("express");
var app = express();

var server = app.listen(3000, () => {
  console.log("server is running on port", server.address().port);
 });

 app.use(express.static(__dirname));

 var Message = ("Message",{ name: String, message: String });
 
 var bodyParser = require("body-parser")
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({extended: false}))

 //fucntion gets the messages from the database
 app.get('/messages', (req, res) => {
  Message.find({},(err, messages)=> {
    res.send(messages);
  })
})

//function then posts the messages to the server
app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) =>{
    if(err)
      sendStatus(500);
    io.emit('message', req.body);
    res.sendStatus(200);
  })
})

var http = require("http").Server(app);
var io = require("socket.io")(http);

io.on("connection", () =>{
  console.log("a user is connected")
 })
