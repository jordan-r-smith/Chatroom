require 'em-websocket'
require 'json'

EventMachine.run do
  @channel = EM::Channel.new
  @subscribers = {}

  EventMachine::WebSocket.start(host: '127.0.0.1', port: 8080, debug: true) do |ws|
    ws.onopen do |handshake|
      sid = @channel.subscribe { |msg| ws.send msg }
      puts 'Connection opened'

      username = handshake.query_string.split('=').last

      if @subscribers.value?(username)
        if @subscribers.key(username) != sid
          msg_hash = {
            type: 'username_taken'
          }

          ws.send msg_hash.to_json
        end
      else
        @subscribers[sid] = username

        msg_hash = {
          type: 'connect',
          id: sid,
          username: username,
          userlist: @subscribers,
          timestamp: Time.now.to_i * 1000
        }

        @channel.push msg_hash.to_json
      end

      ws.onmessage do |msg|
        msg_hash = JSON.parse(msg)
        msg_hash['timestamp'] = Time.now.to_i * 1000

        @channel.push msg_hash.to_json
      end

      ws.onclose do
        username = @subscribers[sid]

        @subscribers.delete(sid)

        if username
          msg_hash = {
            type: 'disconnect',
            username: username,
            userlist: @subscribers
          }

          @channel.push msg_hash.to_json
        end

        @channel.unsubscribe(sid)
        puts 'Connection closed'
      end
    end
  end

  puts 'Server started'
end
