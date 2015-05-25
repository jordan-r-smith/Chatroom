require 'em-websocket'
require 'json'

#
# broadcast all ruby related tweets to all connected users!
#

EventMachine.run {
  @channel = EM::Channel.new

  EventMachine::WebSocket.start(:host => "127.0.0.1", :port => 8080, :debug => true) do |ws|

    ws.onopen {
      sid = @channel.subscribe { |msg| ws.send msg }

      msg_hash = {
        type: 'connect',
        id: sid,
        text: 'Connected!'
      }

      #@channel.push "#{sid} connected!"
      @channel.push msg_hash.to_json

      ws.onmessage { |msg|
        @channel.push msg
      }

      ws.onclose {
        @channel.unsubscribe(sid)
      }
    }

  end

  puts "Server started"
}
