'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var chatuba = require('./lib/chatuba-server');


app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

chatuba.listen(http);

http.listen(3000, function(){
  console.log('listening on *:3000');
});