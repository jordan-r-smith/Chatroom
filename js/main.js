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

  if (!("WebSocket" in window)) {
    $('#chatLog, input, button, #examples').fadeOut("fast");
    $('<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>').appendTo('#container');
  } else {
    //The user has WebSockets

    function connect(username) {
        var socket;
        var host = 'ws://localhost:8080/server.rb?username=' + username;

        try {
          var socket = new WebSocket(host);

          socket.onopen = function() {
            //message('<p class="event">Connection Open</p>');
          }

          socket.onmessage = function(event) {
            var msg = JSON.parse(event.data);
            var timestamp = new Date(msg.timestamp);
            var time = timestamp.toTimeString().split(' ')[0];

            switch (msg.type) {
              case 'connect':
                message('<p class="event">' + msg.text + '</p>');
                break;
              case 'chat':
                message('<p class="message"><em>[' + time + '] ' + msg.username + ' ></em> ' + msg.text + '</p>');
                break;
            }

            $("#chatLog").scrollTop($("#chatLog")[0].scrollHeight);
          }

          socket.onclose = function() {
            message('<p class="event">Disconnected</p>');
          }

        } catch (exception) {
          message('<p class="warning">Error: ' + exception + '</p>');
        }

        function send() {
          var username = $('#username').val();
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

          try {
            socket.send(JSON.stringify(msg));
          } catch (exception) {
            message('<p class="warning">Error: ' + exception + '</p>');
          }

          $('#text').val("");
        }

        function message(msg) {
          $('#chatLog').append(msg);
          $("#chatLog").scrollTop($("#chatLog")[0].scrollHeight);
        }

        $('#text').keypress(function(event) {
          if (event.keyCode == '13') {
            send();
          }
        });

        $('#send').click(function() {
          send();
        });

        $('#disconnect').click(function() {
          socket.close();
          $('#username').prop('disabled', false);
          $('#connect').prop('disabled', false);

          $('#text').prop('disabled', true);
          $('#send').prop('disabled', true);
          $('#disconnect').prop('disabled', true);
        });

      } //End connect

    function login() {
      var username = $('#username').val();

      if (username == "") {
        console.log('Enter a username')
      } else {
        $('#username').prop('disabled', true);
        $('#connect').prop('disabled', true);

        $('#text').prop('disabled', false);
        $('#send').prop('disabled', false);
        $('#disconnect').prop('disabled', false);
        connect(username);
      }
    } //End login

    $('#username').keypress(function(event) {
      if (event.keyCode == '13') {
        login();
      }
    });

    $('#connect').click(function() {
      login();
    });

  } //End else

});
