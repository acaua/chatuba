'use strict';

var socketio = require('socket.io');
var passportSocketIo = require("passport.socketio");

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
  console.log('Parsed kafka data: ', data);

  switch(data.event) {
    case 'chat message':
      io.emit('chat message', {username: data.payload.username, message: data.payload.message});
      break;
    case 'user connect':
      io.emit('user connect', data.payload.username);
      break;
    case 'user disconnect':
      io.emit('user disconnect', data.payload.username);
      break;
    default:
      console.log('Unknown event');
  }
});

consumer.on('error', function (err) {
  console.log('error', err);
});


exports.listen = function(http, sessionStore) {

  io = socketio(http);

  io.use(passportSocketIo.authorize({
    secret: process.env.SECRET_KEY_BASE || 'session secret',
    store: sessionStore
  }));

  io.on('connection', function(socket){
    console.log('websocket connected. User: ' + socket.request.user.username);
    socket.emit('whoami', socket.request.user.username);
    if (users.indexOf(socket.request.user.username) == -1) {
      users.push(socket.request.user.username);
      users.sort();
      //io.emit('user connect', socket.request.user.username);

      var data = {event: 'user connect', payload: {username: socket.request.user.username}};
      producer.send([{topic: topic, messages: JSON.stringify(data)}], function (err, data) {
        if (err) console.log('error', err);
      });

    };
    sendUserList();

    socket.on('disconnect', function(){
      console.log('websocket disconnected. User: ' + socket.request.user.username);
      if(socket.request.user.username){
        var index = users.indexOf(socket.request.user.username);
        if (index > -1) {
          users.splice(index, 1);
        }
        //socket.broadcast.emit('user disconnect', socket.request.user.username);

        var data = {event: 'user disconnect', payload: {username: socket.request.user.username}};
        producer.send([{topic: topic, messages: JSON.stringify(data)}], function (err, data) {
          if (err) console.log('error', err);
        });
      }
    });

    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
      var data = {event: 'chat message', payload: {username: socket.request.user.username, message: msg}};
      producer.send([{topic: topic, messages: JSON.stringify(data)}], function (err, data) {
        if (err) console.log('error', err);
      });
    });

    socket.on('get users', function(){
      sendUserList();
    });


    function sendUserList() {
      socket.emit('user list', users);
    };
  });
};