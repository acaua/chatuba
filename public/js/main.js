$(document).ready(function(){
  var socket = io();
  var myUsername;

  $('#form-username').submit(function(e){
    e.preventDefault();
    var username = $('#username').val();
    socket.emit('login', username, function(err, msg) {
      if (err) {
        $('#login-error').text(msg);
        $('#login-error').html('<div class="alert alert-success fade in alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + msg);
      } else {
        myUsername = username;
        $('#username-wrapper').hide();
        $('#chat-wrapper').show();
        $('#myusername').text(myUsername + ': ');
      }
    });
  });

  $('#form-message').submit(function(e){
    e.preventDefault();
    var msg =  $('#message').val();
    socket.emit('chat message', msg);
    $('#message').val('');
    $('#messages').append($('<li>').html('<strong>' + myUsername + ': </strong>' + msg));
  });

  socket.on('chat message', function(msg){
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