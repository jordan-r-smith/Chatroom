require 'em-websocket'
require 'json'

#
# broadcast all ruby related tweets to all connected users!
#

EventMachine.run {
  @channel = EM::Channel.new

  EventMachine::WebSocket.start(:host => "127.0.0.1", :port => 8080, :debug => true) do |ws|

    ws.onopen { |handshake|
      sid = @channel.subscribe { |msg| ws.send msg }

      username = handshake.query_string.split('=').last

      msg_hash = {
        type: 'connect',
        id: sid,
        text: "#{username} connected!",
        username: username,
        timestamp: Time.now.to_i * 1000
      }

      @channel.push msg_hash.to_json

      ws.onmessage { |msg|
        msg_hash = JSON.parse(msg)
        msg_hash["timestamp"] = Time.now.to_i * 1000

        @channel.push msg_hash.to_json
      }

      ws.onclose {
        @channel.unsubscribe(sid)
      }
    }

  end

  puts "Server started"
}
