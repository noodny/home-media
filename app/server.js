var restify = require('restify'),
    _ = require('lodash'),
    socketio = require('socket.io'),
    Terminal = require('./terminal.js'),
    Downloads = new (require('./downloads.js'))();


var Server = function(config) {
    this.config = config;

    this.initialize();
};

Server.prototype = {
    initialize: function() {
        this.sessions = {};
        this.restify = restify.createServer();
        this.io = socketio.listen(this.restify);

        this.restify.get(/.*/, restify.serveStatic({
            directory: './public',
            default: 'index.html'
        }));
        this.io.sockets.on('connection', this.onSocketConnection.bind(this));

        this.restify.listen(this.config.server.port);

        console.log('Server listening on port ' + this.config.server.port);
    },

    onSocketConnection: function(socket) {
        if(typeof this.sessions[socket.id] === 'undefined') {
            this.sessions[socket.id] = {
                terminal: new Terminal(),
                busy: false
            }
        }

        //socket.on('library:get');
        //
        //socket.on('player:pause');
        //socket.on('player:play');
        //socket.on('player:stop');
        //socket.on('player:forward');
        //socket.on('player:backward');
        //
        //socket.on('downloads:get');
        //socket.on('downloads:search');
        //socket.on('downloads:add');

        Downloads.on('status', socket.emit('downloads:status'));

        socket.on('close', function() {
            delete this.sessions[socket.id];
        });
    }
};

module.exports = Server;
