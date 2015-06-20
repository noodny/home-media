var EventEmitter = require('events').EventEmitter,
    _db = require('underscore-db'),
    _ = require('lodash'),
    fs = require('fs'),
    config = require('../config.json'),
    async = require('async'),
    tmdb = require('tmdb-3')(config.tmdbApiKey),
    videoExtensions = ['avi', 'mov', 'mkv', 'mp4'];

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

var execFile = require('child_process').execFile;

var Media = {
    wasScanned: function(details) {
        return db.scanned.indexOf(Media.getPath(details)) > -1;
    },
    markAsScanned: function(details) {
        db.scanned.push(Media.getPath(details));
    },
    getQuery: function(details) {
        var query = {
            title: details.title
        };

        if(details.season && details.episode) {
            query.type = 'tv';
        } else {
            query.type = 'movie';
        }

        if(details.year) {
            query.year = details.year;
        }

        return query;
    },
    isSeries: function(details) {
        return details.season !== null && details.episode !== null;
    },
    getNormalizedTitle: function(details) {
        return details.title.replace(/ /g, '').toLowerCase().trim();
    },
    getPath: function(details) {
        return details.location + details.filename;
    }
};

_.mixin(_db);
var db;

try {
    db = _.load();
} catch (e) {
    db = {
        lastScan: false,
        movies: [],
        series: [],
        episodes: [],
        scanned: []
    };
    _.save(db);
}

var Movies = function() {

};

Movies.prototype = Object.create(EventEmitter.prototype);

Movies.prototype.get = function(callback) {
};

Movies.prototype.update = function(callback) {
    db.lastScan = Date.now();

    this.listVideoFiles(function(files) {
        var parsed = _.map(files, this.parseFileDetails);

        async.eachLimit(parsed, 1, function(details, callback) {
            // check if this file has been scanned before
            console.log(details.title)
            if(!Media.wasScanned(details)) {
                //Media.getQuery(details);

                // if this is a tv show look up the whole series, then the episode
                if(Media.isSeries(details)) {
                    var series = _.find(db.series, {normalizedTitle: Media.getNormalizedTitle(details)});

                    // check if the series is already cached
                    if(!series) {
                        apiRequest('search', {
                            type: 'tv',
                            query: {
                                query: details.title
                            }
                        }, function(res, err) {
                            if(err) {
                                throw new Error(err);
                            }

                            if(res) {
                                series = res;
                                series.normalizedTitle = Media.getNormalizedTitle(details);

                                _.insert(db.series, series);
                                _.save(db);

                                apiRequest('episode', {
                                    season: details.season,
                                    episode: details.episode,
                                    id: series.id
                                }, function(res, err) {
                                    if(res) {
                                        _.insert(db.episodes, res);
                                    }
                                    Media.markAsScanned(details);
                                    callback(err || null);
                                });
                            } else {
                                Media.markAsScanned(details);
                                console.error('cannot find series ' + details.title);
                                callback();
                            }
                        });
                    } else {
                        apiRequest('episode', {
                            season: details.season,
                            episode: details.episode,
                            id: series.id
                        }, function(res, err) {
                            if(res) {
                                _.insert(db.episodes, res);
                            }
                            Media.markAsScanned(details);
                            callback(err || null);
                        });
                    }
                } else {
                    console.log('fetching ' + details.title)
                    apiRequest('search', {
                        type: 'movie',
                        query: {
                            query: details.title,
                            year: details.year
                        }
                    }, function(res, err) {
                        console.log(res, err);
                        res._src = details;
                        _.insert(db.movies, res);
                        Media.markAsScanned(details);
                        console.log('fetched ' + details.title);
                        callback(err || null);
                    });
                }
            } else {
                console.log('already scanned ' + details.title);
                callback();
            }
        }.bind(this), function(err, res) {
            // console.log('done', db)
            // save the scan results to a file
            _.save(db);
        });


    }.bind(this));
};

var apiRequest = function(type, params, callback) {
    if(type === 'search') {
        tmdb.search(params.type, params.query, function(err, res) {
            setTimeout(callback.bind(this, res.results[0], err), 250);
        })
    }
    if(type === 'episode') {
        tmdb.episode(params.season, params.episode, params.id, function(err, res) {
            setTimeout(callback.bind(this, res, err), 250);
        })
    }
};

Movies.prototype.listVideoFiles = function(callback) {
    console.log(getFindArgs())
    execFile('find', getFindArgs(), function(err, stdout, stderr) {
        console.error(err);
        console.error(stderr);
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
};

Movies.prototype.parseFileDetails = function(filename) {
    var path = filename.split('/'),
        name = path[path.length - 1];

    var skip = function(str) {
        return str.replace('1080p', '').replace('720p', '').replace('x264', '');
    };

    var title = name.match(/[a-zA-Z\. ]*/),
        year = skip(name).match(/[^0-9]([0-9]{4})[^0-9]/),
        season = skip(name).match(/[^a-zA-Z]S([0-9]+)*/i),
        episode = skip(name).match(/[^a-zA-Z]E([0-9]+)*/i);

    if(title && title[0]) {
        title = title[0].replace(/\./g, ' ').trim();

        if(title.indexOf(' S') === title.length - 2 || title.indexOf(' s') === title.length - 2) {
            title = title.substring(0, title.length - 2);
        }
    }

    if(year && year[1]) {
        year = year[1];
    }

    if(season && season[1]) {
        season = season[1];
    }

    if(episode && episode[1]) {
        episode = episode[1];
    }

    if((!season || !episode) && parseInt(year) < 1990) {
        season = year.substr(0, 2);
        episode = year.substr(2, 4);
        year = null;
    }

    // check for different combinations of season/episode notations
    if(!season || !episode) {
        var combined = skip(name).match(/([0-9]{1,2})x([0-9]{1,2})/);

        if(combined && combined.length === 3) {
            season = combined[1];
            episode = combined[2];
        } else {
            combined = skip(name).match(/[^0-9]([0-9]{3})[^0-9]/);

            if(combined && combined.length === 2) {
                season = combined[1].substr(0, 1);
                episode = combined[1].substr(1, 3);
            }
        }
    }

    if(year) {
        year = parseInt(year);
    }

    if(season) {
        season = parseInt(season);
    }

    if(episode) {
        episode = parseInt(episode);
    }

    return {
        location: filename.replace(name, ''),
        filename: name,
        title: title,
        year: year,
        season: season,
        episode: episode
    };
};

var lib = new Movies();
lib.update();

module.exports = Movies;
