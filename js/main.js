new function() {
  var socket = null;
  var host = null;
  var username = null;

  var message = function(msg) {
    $('#chatLog').append(msg);
    $("#chatLog").scrollTop($("#chatLog")[0].scrollHeight);
  }

  var addUser = function(user) {
    $('#userlist').append('<li class="list-group-item">' + user + '</li>');
  }

  var updateUserList = function(userlist) {
    $('#userlist').html('');
    for (var user in userlist) {
      if (userlist.hasOwnProperty(user)) {
        addUser(userlist[user]);
      }
    }
  }

  var close = function() {
    if (socket) {
      console.log('Closing...');
      socket.close();
    }
  }

  var disconnect = function() {
    $('#username').prop('disabled', false);
    $('#connect').prop('disabled', false);

    $('#text').prop('disabled', true);
    $('#send').prop('disabled', true);
    $('#disconnect').prop('disabled', true);

    close();
  }

  var connect = function() {
    host = 'ws://localhost:8080/server.rb?username=' + username;

    try {
      console.log('Connecting...');
      socket = new WebSocket(host);
    } catch (exception) {
      message('<p class="warning">Error: ' + exception + '</p>');
    }

    socket.onopen = onOpen;
    socket.onmessage = onMessage;
    socket.onclose = onClose;
  }

  var onOpen = function() {}

  var onMessage = function(event) {
    var msg = JSON.parse(event.data);
    var timestamp = new Date(msg.timestamp);
    var time = timestamp.toTimeString().split(' ')[0];

    switch (msg.type) {
      case 'connect':
        updateUserList(msg.userlist);

        if (username == msg.username) {
          message('<p class="event">You connected.</p>');
        } else {
          message('<p class="event">' + msg.username + ' connected!</p>');
        }

        break;
      case 'username_taken':
        $('#username').parent().parent().addClass('has-error');
        message('<p class="event">Username is taken.</p>');
        disconnect();
        break;
      case 'chat':
        if (username == msg.username) {
          message('<p class="message"><em class="text-primary">[' + time + '] ' + msg.username + ' ></em> ' + msg.text + '</p>');
        } else {
          message('<p class="message"><em>[' + time + '] ' + msg.username + ' ></em> ' + msg.text + '</p>');
        }

        break;
      case 'disconnect':
        updateUserList(msg.userlist);

        if (username == msg.username) {
          message('<p class="event">Disconnected.</p>');
        } else {
          message('<p class="event">' + msg.username + ' has disconnected.</p>');
        }
        break;
    }
  }

  var onClose = function(event) {
    $('#userlist').html('');
  }

  var send = function(msg) {
    try {
      if (socket && socket.readyState == WebSocket.OPEN) {
        socket.send(msg);
      }
    } catch (exception) {
      message('<p class="warning">Error: ' + exception + '</p>');
    }

    $('#text').val('');
  }

  var chat = function() {
    var text = $('#text').val();

    if (text == "") {
      message('<p class="warning">Please enter a message.</p>');
      return;
    }

    var msg = {
      type: 'chat',
      username: username,
      text: text
    }

    msg = JSON.stringify(msg);
    send(msg);
  }

  var login = function() {
    username = $('#username').val();

    if (username == "") {
      $('#username').parent().parent().addClass('has-error');
    } else {
      try {
        $('#username').parent().parent().removeClass('has-error');

        $('#username').prop('disabled', true);
        $('#connect').prop('disabled', true);

        $('#text').prop('disabled', false);
        $('#send').prop('disabled', false);
        $('#disconnect').prop('disabled', false);

        connect(username);
      } catch (exception) {
        console.log('Error: ' + exception);
      }
    }
  }

  var startListeners = function() {
    // Login using Enter key
    $('#username').keypress(function(event) {
      if (event.keyCode == '13') {
        login();
      }
    });

    // Login using Connect button
    $('#connect').click(function() {
      login();
    });

    // Send a chat message using the Enter key
    $('#text').keypress(function(event) {
      if (event.keyCode == '13') {
        chat();
      }
    });

    // Send a chat message using the Send button
    $('#send').click(function() {
      chat();
    });

    // Disconnect using Disconnect button
    $('#disconnect').click(function() {
      disconnect();
    });
  }

  WebSocketClient = {
    init: function() {
      startListeners();
    }
  }

}

$(document).ready(function() {
  // User has websockets?
  if (!("WebSocket" in window)) {
    $('#chatLog, input, button, #examples').fadeOut("fast");
    $('<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>').appendTo('#errors');
  } else {
    WebSocketClient.init();
  }
});
