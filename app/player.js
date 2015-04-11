var EventEmitter = require('events').EventEmitter,
    kodi_rpc = require('node-kodi'),
    _ = require('lodash');

var Player = function() {
    this.client = new kodi_rpc({
        url: '192.168.0.104:8080'
    });

    setInterval(this.status.bind(this), 1000);
};

Player.prototype = Object.create(EventEmitter.prototype);

Player.prototype.open = function(id) {
    console.log('player play', arguments)
    this.client.player.open({item: {movieid: id}}).then(function(data) {
        console.log(arguments)
    });
};

Player.prototype.play = function() {
    this.client.player.playPause(true);
};

Player.prototype.pause = function() {
    this.client.player.playPause(false);
};

Player.prototype.status = function() {
    this.client.player.getProperties().then(function(properties) {
        this.client.player.getCurrentlyPlayingVideo().then(function(video) {
            properties.video = video;
            this.emit('status', properties);
        }.bind(this));
    }.bind(this));
};

module.exports = Player;
