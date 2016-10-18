var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket){
  console.log('websocket connected');

  socket.on('login', function(username, callback){
    console.log('login try: ' + username);
    if (users.indexOf(username) != -1) {
      callback(true, 'Username taken');
      console.log('user taken: ' + username);
    } else {
      users.push(username);
      users.sort();
      socket.username = username;
      io.emit('user connect', {username: username, users: users});
      callback(false);
      console.log('logged: ' + username);
    }
  });

  socket.on('disconnect', function(){
    console.log('websocket disconnected');

    if(socket.username){
      var index = users.indexOf(socket.username);
      if (index > -1) {
        users.splice(index, 1);
      }
      socket.broadcast.emit('user disconnect', {username: socket.username, users: users});
      console.log(socket.username + ' disconnected');
    }
  });

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    socket.broadcast.emit('chat message', {username: socket.username, message: msg});
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});