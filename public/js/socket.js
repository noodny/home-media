define(['config'], function (config) {
    var instance,
        Socket = {
            initialize: function (headers) {
                this.socket = new io(config.messagesApiUrl);
                this.socket.on('message', this.trigger.bind(this, 'message'));
            }
        };

    if(!instance) {
        instance = _.extend(Socket, Backbone.Events);
    }

    return instance;
});
