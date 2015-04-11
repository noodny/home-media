define(['config'], function (config) {
    var instance,
        Socket = {
            initialize: function () {
                this.socket = new io(config.socketsUrl);
                this.socket.on('message', this.trigger.bind(this, 'message'));
                /*this.socket.on('downloads:status', function(){
                    console.log('test')
                })*/
            },
            emit: function() {
                this.socket.emit.apply(this.socket, arguments);
            },
            on: function() {
                this.socket.on.apply(this.socket, arguments);
            },
            once: function() {
                this.socket.once.apply(this.socket, arguments);
            }
        };

    if(!instance) {
        instance = _.extend(Socket, Backbone.Events);
    }

    return instance;
});
