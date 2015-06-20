var restify = require('restify'),
    _ = require('lodash'),
    socketio = require('socket.io'),
    Subtitles = require('./subtitles.js'),
    Downloads = new (require('./downloads.js'))(),
    Movies = new (require('./movies.js'))(),
    Player = new (require('mplayer'))();


var Server = function(config) {
    this.config = config;

    this.initialize();
};

Server.prototype = {
    initialize: function() {
        this.sessions = {};
        this.restify = restify.createServer();
        this.restify.use(new restify.bodyParser());

        this.io = socketio.listen(this.restify.server);

        this.restify.get('/downloads/', function(req, res, next) {
            res.send(200, Downloads.get()).end();
            next();
        });

        this.restify.get('/movies/', function(req, res, next) {
            res.send(200, Movies.get()).end();
            next();
        });

        this.restify.post('/downloads/add', function(req, res, next) {
            Downloads.add({
                url: req.params.url,
                hash: req.params.hash
            }, function(err, data) {
                if(err) {
                    res.send(err.status || 500, {message: err.message}).end();
                } else {
                    res.send(200).end();
                }
                next();
            });
        });

        this.restify.get('/downloads/search/:query', function(req, res, next) {
            Downloads.search(req.params.query, function(data) {
                res.send(200, data).end();
                next();
            });
        });

        this.restify.get(/.*/, restify.serveStatic({
            directory: './public',
            default: 'index.html'
        }));

        this.io.sockets.on('connection', this.onSocketConnection.bind(this));

        Downloads.on('status', function(data) {
            this.io.sockets.emit('downloads:status', data)
        }.bind(this));

        Downloads.on('finished', function(torrent) {
            this.io.sockets.emit('message', 'Torrent ' + torrent.name + ' finished downloading.')
            console.log(torrent);
            Subtitles.download(torrent);
        }.bind(this));

        /*
         Player.on('status', function(data) {
         this.io.sockets.emit('player:status', data)
         }.bind(this));
         */
        Movies.update(function() {
            this.restify.listen(this.config.port);

            console.log('Server listening on port ' + this.config.port);
        }.bind(this));
    },

    onSocketConnection: function(socket) {
        var socketId = parseInt(socket.id);
        if(typeof this.sessions[socketId] === 'undefined') {
            this.sessions[socketId] = {
                busy: false
            }
        }

        //socket.on('library:get');
        //
        socket.on('player:pause', Player.pause.bind(Player));
        socket.on('player:play', Player.play.bind(Player));
        //socket.on('player:stop');
        //socket.on('player:forward');
        //socket.on('player:backward');
        socket.on('player:open', function(id) {
            var movie = Movies.getById(id);
            console.log(movie);
            Player.open("'" + movie._src.location + movie._src.filename + "'");
        });

        socket.on('downloads:remove', Downloads.remove.bind(Downloads));
        socket.on('downloads:start', Downloads.start.bind(Downloads));
        socket.on('downloads:stop', Downloads.stop.bind(Downloads));

        socket.on('disconnect', function() {
            delete this.sessions[socketId];
        }.bind(this));
    }
};

module.exports = Server;
