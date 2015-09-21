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
                console.log(time);
            });

            Socket.socket.on('player:status', function(data) {
                console.log(data);
            });
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
            this.$list = this.$('.navbar-nav li');
        },
        onItemPlayClick: function(event) {
            event.preventDefault();
            Socket.emit('player:pause');
        }
    });
    return PlayerView;
});
