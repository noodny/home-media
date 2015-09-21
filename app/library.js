var EventEmitter = require('events').EventEmitter.prototype,
    execFile = require('child_process').execFile,
    _ = require('lodash'),
    fs = require('fs'),
    config = require('../config.json'),
    async = require('async'),
    tmdb = require('tmdb-3')(config.tmdbApiKey),
    Media = require('./models/media.js'),
    Movie = require('./models/movie.js'),
    Series = require('./models/series.js'),
    Episode = require('./models/episode.js'),
    Db = require('./database.js');

var apiRequest = function(type, params, callback) {
    // delay callbacks to avoid exceeding of rate limit
    if(type === 'search') {
        tmdb.search(params.type, params.query, function(err, res) {
            setTimeout(callback.bind(this, res, err), 250);
        })
    }
    if(type === 'episode') {
        tmdb.episode(params.season, params.episode, params.id, function(err, res) {
            setTimeout(callback.bind(this, res, err), 250);
        })
    }
};
var fetchSeries = function(media, callback) {
    apiRequest('search', {
        type: 'tv',
        query: {
            query: media.get('title')
        }
    }, function(res, err) {
        if(err) {
            console.error('Series fetching error: ' + err);
        }

        if(res && res.results && res.results.length) {
            var series = res.results[0];
            series.searchKey = media.getSearchKey();

            series = new Series(series, {parse: true});
            series.save();

            callback(err, series);
        } else {
            err = 'Series fetching error: ' + 'Series not found - ' + media.get('title');
            console.error(err);
            callback(err, null);
        }
    });
};
var fetchEpisode = function(media, series, callback) {
    apiRequest('episode', {
        season: media.get('season'),
        episode: media.get('episode'),
        id: series.get('id')
    }, function(res, err) {
        if(err) {
            console.error('Episode fetching error: ' + err);
        }

        media.markAsScanned();

        if(res) {
            var episode = res;
            episode.seriesId = series.get('id');
            episode._src = media.toJSON();

            episode = new Episode(episode, {parse: true});
            episode.save();

            callback(err, episode);
        } else {
            err = 'Episode fetching error: ' + 'Episode not found - ' + media.get('title');
            console.error(err);
            callback(err, null);
        }
    });
};

var fetchMovie = function(media, callback) {
    apiRequest('search', {
        type: 'movie',
        query: {
            query: media.get('title'),
            year: media.get('year')
        }
    }, function(res, err) {
        if(err) {
            console.error('Movie fetching error: ' + err);
        }

        media.markAsScanned();

        if(res && res.results && res.results.length) {
            var movie = res.results[0];
            movie._src = media.toJSON();

            movie = new Movie(movie, {parse: true});
            movie.save();

            callback(err, movie);
        } else {
            err = 'Movie fetching error: ' + 'Movie not found - ' + media.get('title');
            console.error(err);
            callback(null, null);
        }
    });
};

var Library = function() {
};

Library.prototype = _.extend({
    update: function(done) {
        this.emit('update:start');
        Db.set('lastScan', Date.now());

        this.listVideoFiles(function(files) {
            var parsed = _.map(files, function(filename) {
                return new Media({
                    filename: filename
                }, {
                    parse: true
                });
            });

            var counter = parsed.length;
            async.eachLimit(parsed, 1, function(media, callback) {
                if(media.get('title') === null) {
                    return callback();
                }
                // check if this file has been scanned before
                if(!media.wasScanned()) {
                    this.getFileInfo(media.getPath(), function(data) {
                        media.set(data);

                        // if this is a tv show look up the whole series, then the episode
                        if(media.isSeries()) {
                            var series = Db.find('series', {searchKey: media.getSearchKey()});
                            // check if the series is already cached
                            if(!series.length) {
                                fetchSeries(media, function(err, series) {
                                    if(series) {
                                        fetchEpisode(media, series, function(err, res) {
                                            this.emit('update:progress', 1 - (--counter / parsed.length));
                                            callback(err || null);
                                        }.bind(this));
                                    } else {
                                        media.markAsScanned();
                                        this.emit('update:progress', 1 - (--counter / parsed.length));
                                        callback(err || null);
                                    }
                                }.bind(this));
                            } else {
                                series = new Series(series[0], {parse: true});
                                fetchEpisode(media, series, function(err, res) {
                                    this.emit('update:progress', 1 - (--counter / parsed.length));
                                    callback(err || null);
                                }.bind(this));
                            }
                        } else {
                            fetchMovie(media, function(err, res) {
                                this.emit('update:progress', 1 - (--counter / parsed.length));
                                callback(err || null);
                            }.bind(this));
                        }
                    }.bind(this));
                } else {
                    this.emit('update:progress', 1 - (--counter / parsed.length));
                    callback();
                }
            }.bind(this), function(err, res) {
                Db.save();
                this.emit('update:finish');
                if(done && _.isFunction(done)) {
                    done();
                }
            }.bind(this));
        }.bind(this));
    },
    forceUpdate: function(done) {
        Db.empty();
        this.update(done);
    },
    getFileInfo: function(file, callback) {
        execFile('ffmpeg', ['-i', file], function(err, stdout, stderr) {
            if(stdout) {
                var duration = stdout.match(/Duration: ([0-9:]*)/);
            } else {
                var duration = stderr.match(/Duration: ([0-9:]*)/);
            }

            callback({
                duration: (_.isArray(duration) && duration.length ? duration[1] : 0)
            });
        }.bind(this));
    },
    listVideoFiles: function(callback) {
        var getFindArgs = function() {
            var args = [];
            _.each(config.directories, function(dir) {
                if(dir.indexOf('^') === 0) {
                    args.push('-not');
                    args.push('-path');
                    args.push(dir.substring(1, dir.length) + '/*');
                } else {
                    args.push(dir);
                }
            });
            return args;
        };

        var videoExtensions = config.videoExtensions;

        execFile('find', getFindArgs(), function(err, stdout, stderr) {
            if(err) {
                throw new Error(err);
            }
            if(stderr) {
                throw new Error(stderr);
            }

            var files = stdout.split('\n'),
                filtered = [];

            _.each(files, function(filename) {
                _.each(videoExtensions, function(ext) {
                    if(filename.indexOf('.' + ext) === filename.length - ('.' + ext).length) {
                        filtered.push(filename);
                    }
                })
            });

            callback(filtered);
        }.bind(this));
    },
    get: function(collection) {
        return Db.get(collection);
    },
    getById: function(collection, id) {
        return Db.find(collection, {id: id});
    },
    getEpisodes: function(id) {
        return Db.find('episodes', {seriesId: parseInt(id)});
    }
}, EventEmitter);

module.exports = Library;
