'use strict';

var socketio = require('socket.io');

var kafka = require('kafka-node');
var client = new kafka.Client('10.1.1.11:2181'); // TODO: change hardcoded address
var producer = new kafka.HighLevelProducer(client);
var topic = 'chat';
var options = { autoCommit: true, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };
var consumer = new kafka.HighLevelConsumer(client, [{topic: topic}], options);
var io;
var users = [];


producer.on('ready', function () {
	console.log('Producer ready!');
});

producer.on('error', function (err) {
  console.log('error', err);
});


consumer.on('message', function (message) {
	var data = JSON.parse(message.value);
  console.log('Parsed kafka data:' + data.username + ': ' + data.message);
  io.emit('chat message', {username: data.username, message: data.message});
});

consumer.on('error', function (err) {
  console.log('error', err);
});


exports.listen = function(http) {

	io = socketio.listen(http);

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
	    var data = JSON.stringify({username: socket.username, message: msg});
	    producer.send([{topic: topic, messages: data}], function (err, data) {
		  	if (err) console.log('error', err);
		  });
	  });

	});
};