define([
    'socket',
    'text!templates/player.html'
], function(Socket, viewTemplate) {
    var PlayerView = Backbone.View.extend({
        events: {
            'click .item-play': 'onItemPlayPauseClick'
        },
        initialize: function() {
            Socket.socket.on('player:status', function(data) {
                console.log(data);
            });
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
            this.$list = this.$('.navbar-nav li');
        },
        onItemPlayPauseClick: function(event) {
            event.preventDefault();
            Socket.emit('player:pause');
        }
    });
    return PlayerView;
});
