$(document).ready(function(){
  var socket = io();
  var myUsername;

  $('#form-message').submit(function(e){
    e.preventDefault();
    var msg =  $('#message').val();
    socket.emit('chat message', msg);
    $('#message').val('');
    $('#messages').append($('<li>').html('<strong>' + myUsername + ': </strong>' + msg));
  });

  socket.on('whoami', function(username) {
    myUsername = username;
    $('#my-username').text(myUsername);
  });

  socket.on('chat message', function(msg){
    if (msg.username != myUsername)
      $('#messages').append($('<li>').html('<strong>' + msg.username + ': </strong>' + msg.message));
  });

  socket.on('user connect', function(msg){
    $('#messages').append($('<li>').html('User joined: <strong>' + msg.username + '</strong>'));

    updateUserList(msg.users);
  });      

  socket.on('user disconnect', function(msg){
    $('#messages').append($('<li>').html('User left: <strong>' + msg.username + '</strong>'));

    updateUserList(msg.users);
  }); 

});

function updateUserList(userlist) {
  var userListLi = [];
  $.each(userlist, function(i, item){
    userListLi.push($('<li>').text(item));
  });
  $('#users').empty().append(userListLi);
};