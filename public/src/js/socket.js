define(['config'], function (config) {
    var instance,
        Socket = {
            initialize: function () {
                this.socket = new io(window.location.hostname + ':' + config.apiPort);
                this.socket.on('message', this.trigger.bind(this, 'message'));
                /*this.socket.on('downloads:status', function(){
                    console.log('test')
                })*/
                if(true) {
                    this.socket.on('library:update:start', console.log.bind(console, 'library:update:start'));
                    this.socket.on('library:update:finish', console.log.bind(console, 'library:update:finish'));
                    this.socket.on('library:update:progress', console.log.bind(console, 'library:update:progress'));
                    this.socket.on('player:play', console.log.bind(console, 'player:play'));
                    this.socket.on('player:pause', console.log.bind(console, 'player:pause'));
                    this.socket.on('player:start', console.log.bind(console, 'player:start'));
                    this.socket.on('player:stop', console.log.bind(console, 'player:stop'));
                }
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
