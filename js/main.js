/*var view = {
  init: function() {
    this.render();
  },
  render: function() {
  }
}

var controller = {
  init: function() {
    model.init();
    view.init();
  },
  submit: function() {
    model.save();
  }
}

var model = {
  init: function() {
  },
  save: function() {
  }
}

controller.init();
*/

$(document).ready(function() {

  // User has websockets?
  if (!("WebSocket" in window)) {
    $('#chatLog, input, button, #examples').fadeOut("fast");
    $('<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>').appendTo('#errors');
  } else {
    var socket;
    
    function connect(username) {
      var host = 'ws://localhost:8080/server.rb?username=' + username;

      try {
        socket = new WebSocket(host);

        socket.onopen = function() {
          message('<p class="event">ReadyState: ' + socket.readyState + '</p>');
        }

        socket.onmessage = function(event) {
          var msg = JSON.parse(event.data);
          var timestamp = new Date(msg.timestamp);
          var time = timestamp.toTimeString().split(' ')[0];

          switch (msg.type) {
            case 'connect':
              if (username == msg.username) {
                message('<p class="event">You connected.</p>');
              } else {
                message('<p class="event">' + msg.text + '</p>');
              }
              break;
            case 'chat':
              if (username == msg.username) {
                message('<p class="message"><em class="text-primary">[' + time + '] ' + msg.username + ' ></em> ' + msg.text + '</p>');
              } else {
                message('<p class="message"><em>[' + time + '] ' + msg.username + ' ></em> ' + msg.text + '</p>');
              }
              break;
            case 'disconnect':
              if (username == msg.username) {
                message('<p class="event">Disconnected.</p>');
              } else {
                message('<p class="event">' + msg.username + ' has disconnected.</p>');
              }
              break;
          }

          $("#chatLog").scrollTop($("#chatLog")[0].scrollHeight);
        }

        socket.onclose = function(event) {
          message('<p class="event">Disconnected.</p>');
          message('<p class="event">ReadyState: ' + socket.readyState + '</p>');
          console.log("Closed - code: " + event.code + ", reason: " + event.reason + ", wasClean: " + event.wasClean);
        }

      } catch (exception) {
        message('<p class="warning">Error: ' + exception + '</p>');
      }

      function send(msg) {
        try {
          socket.send(msg);
        } catch (exception) {
          message('<p class="warning">Error: ' + exception + '</p>');
        }

        $('#text').val("");
      }

      function close() {
        try {
          socket.close();
        } catch (exception) {
          message('<p class="warning">Error: ' + exception + '</p>');
        }
      }

      function message(msg) {
        $('#chatLog').append(msg);
        $("#chatLog").scrollTop($("#chatLog")[0].scrollHeight);
      }

      function chat() {
        var username = $('#username').val();
        var text = $('#text').val();

        if (text == "") {
          message('<p class="warning">Text: ' + text + '</p>');
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

      function disconnect() {
        var username = $('#username').val();

        var msg = {
          type: 'disconnect',
          username: username
        }

        msg = JSON.stringify(msg);
        send(msg);

        $('#username').prop('disabled', false);
        $('#connect').prop('disabled', false);

        $('#text').prop('disabled', true);
        $('#send').prop('disabled', true);
        $('#disconnect').prop('disabled', true);

        close();
      }

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

      $('#disconnect').click(function() {
        disconnect();
      });

      window.onbeforeunload = function() {
        disconnect();
      }

    }

    function login() {
      var username = $('#username').val();

      if (username == "") {
        $('#username').css({
          "border": "1px solid red"
        });
      } else {
        try {
          $('#username').css({
            "border": "1px solid #dddddd"
          });

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

  }

});
