var EventEmitter = require('events').EventEmitter,
    kodi_rpc = require('node-kodi'),
    _ = require('lodash'),
    config = require('../config.json');

var Movies = function() {
    this.client = new kodi_rpc({
        url: config.host + ':' + config.kodiPort
    });
};

Movies.prototype = Object.create(EventEmitter.prototype);

Movies.prototype.get = function(callback) {
    this.client.videolibrary.getMovies({
        properties: ["thumbnail", "rating", "playcount", "year", "imdbnumber", "setid", "mpaa"]
    }).then(function(data){
        data.movies.forEach(function(movie){
            console.log(movie)
        });
        callback(data.movies);
    });
};

Movies.prototype.update = function(callback) {

};

module.exports = Movies;
