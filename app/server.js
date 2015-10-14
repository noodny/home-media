var restify = require('restify'),
    _ = require('lodash'),
    socketio = require('socket.io'),
    request = require('request'),
    Subtitles = require(__dirname + '/subtitles.js'),
    Downloads = new (require(__dirname + '/downloads.js'))(),
    Library = new (require(__dirname + '/library.js'))(),
    Player = new (require('mplayer'))(),
    Movie = require(__dirname + '/models/movie.js'),
    Series = require(__dirname + '/models/series.js'),
    Episode = require(__dirname + '/models/episode.js'),
    Radio = require(__dirname + '/models/radio.js'),
    Db = require(__dirname + '/database.js');


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

        this.restify.get('/library/updatef', function(req, res, next) {
            Library.forceUpdate(function() {
                res.send(200).end();
                next();
            });
        });

        this.restify.get('/library/movies', function(req, res, next) {
            res.send(200, Library.get('movies')).end();
            next();
        });

        this.restify.get('/library/series', function(req, res, next) {
            res.send(200, Library.get('series')).end();
            next();
        });

        this.restify.get('/library/series/:id/episodes', function(req, res, next) {
            res.send(200, Library.getEpisodes(req.params.id)).end();
            next();
        });

        this.restify.post('/radios', function(req, res, next) {
            if(req.params.stream && req.params.stream.indexOf('.pls') === req.params.stream.length - 4) {
                request(req.params.stream, function(error, response, body) {
                    if(body && body.indexOf('[playlist]') > -1) {
                        var title;

                        if(!req.params.title) {
                            title = body.match(/Title1=(.*)/)[1];
                        } else {
                            title = req.params.title;
                        }

                        var radio = new Radio({
                            title: title,
                            stream: req.params.stream,
                            image: req.params.image || null
                        }, {
                            parse: true
                        });

                        radio.save();
                        Db.save();
                        res.send(200).end();
                        next();
                    } else {
                        res.send(400, 'Only .pls files are accepted').end();
                        next();
                    }
                });
            } else {
                res.send(400, 'Missing playlist url parameter').end();
                next();
            }
        });

        this.restify.get('/radios', function(req, res, next) {
            res.send(200, Library.get('radios')).end();
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
            directory: __dirname + '/../public/dist/',
            default: 'index.html'
        }));

        this.io.sockets.on('connection', this.onSocketConnection.bind(this));

        Downloads.on('status', function(data) {
            this.io.sockets.emit('downloads:status', data)
        }.bind(this));

        Downloads.on('finished', function(torrent) {
            this.io.sockets.emit('message', 'Torrent ' + torrent.name + ' finished downloading.');
            Subtitles.download(torrent);
        }.bind(this));

        Library.on('update:start', function() {
            this.io.sockets.emit('library:update:start')
        }.bind(this));

        Library.on('update:finish', function() {
            this.io.sockets.emit('library:update:finish')
        }.bind(this));

        Library.on('update:progress', function(data) {
            this.io.sockets.emit('library:update:progress', data)
        }.bind(this));

        var playerStatus;
        Player.on('status', function(data) {
            playerStatus = data;
            this.io.sockets.emit('player:status', data);
        }.bind(this));

        Player.on('time', function(time) {
            this.io.sockets.emit('player:time', time);
        }.bind(this));

        Player.on('start', function() {
            this.io.sockets.emit('player:start');
        }.bind(this));

        Player.on('pause', function() {
            this.io.sockets.emit('player:pause');
        }.bind(this));

        Player.on('play', function() {
            this.io.sockets.emit('player:play');
        }.bind(this));

        Player.on('stop', function() {
            this.io.sockets.emit('player:stop');
            if(playerStatus.position) {
                var movie = Db.find('movies', {file: playerStatus.filename}),
                    model;

                if(!movie.length) {
                    movie = Db.find('episodes', {file: playerStatus.filename});

                    if(movie.length) {
                        model = new Episode(movie[0])
                    }
                } else {
                    model = new Movie(movie[0]);
                }

                if(model) {
                    model.set({
                        position: playerStatus.position - 3
                    }).save();
                    Db.save();
                    this.io.sockets.emit('library:update:finish')
                }
            }
        }.bind(this));

        this.restify.listen(this.config.port);

        console.log('Server listening on port ' + this.config.port);
    },

    onSocketConnection: function(socket) {
        socket.on('player:pause', Player.pause.bind(Player));
        socket.on('player:play', Player.play.bind(Player));
        socket.on('player:stop', Player.stop.bind(Player));
        //socket.on('player:forward');
        //socket.on('player:backward');
        socket.on('player:open', function(data) {
            if(data.type) {
                if(data.type === 'radio') {
                    var radio = Library.getById('radios', data.id);
                    if(radio.length) {
                        Player.openPlaylist("'" + radio[0].stream + "'", {
                            cache: 128,
                            cacheMin: 50
                        });
                    }
                }
            } else {
                Player.open("'" + data + "'");
            }
        });
        socket.on('player:continue', function(file, time) {
            Player.open("'" + file + "'");
            Player.seek(time);
        });

        socket.on('downloads:remove', Downloads.remove.bind(Downloads));
        socket.on('downloads:start', Downloads.start.bind(Downloads));
        socket.on('downloads:stop', Downloads.stop.bind(Downloads));

        socket.on('library:update', Library.update.bind(Library));
        socket.on('library:update:force', Library.forceUpdate.bind(Library));
    }
};

module.exports = Server;
