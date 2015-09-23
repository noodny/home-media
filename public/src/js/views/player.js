define([
    'socket',
    'text!templates/player.html'
], function(Socket, viewTemplate) {
    var PlayerView = Backbone.View.extend({
        events: {
            'click .item-play': 'onItemPlayClick'
        },
        initialize: function() {
            Socket.socket.on('player:time', function(time) {
                //console.log(time);
            });

            Socket.socket.on('player:status', function(data) {
                //console.log(data);
            });

            Socket.socket.on('player:play', function(data) {
                this.playing = true;
            }.bind(this));

            Socket.socket.on('player:pause', function(data) {
                this.playing = false;
            }.bind(this));
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
            this.$list = this.$('.navbar-nav li');
        },
        onItemPlayClick: function(event) {
            event.preventDefault();

            if(this.playing) {
                Socket.emit('player:pause');
            } else {
                Socket.emit('player:play');
            }
        }
    });
    return PlayerView;
});
