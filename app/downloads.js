var EventEmitter = require('events').EventEmitter,
    Transmission = require('transmission'),
    _ = require('lodash');

var Downloads = function() {
    this.client = new Transmission({
        host: '192.168.0.104',
        port: 9091
    });

    this.on('status', this.checkFinished);

    this.refresh();
    //setInterval(this.refresh.bind(this), 1000);
};

Downloads.prototype = Object.create(EventEmitter.prototype);

Downloads.prototype.checkFinished = function(torrents) {
    torrents.forEach(function(torrent) {
       if(torrent.percentDone === 1) {
           this.emit('finished', torrent);
           this.client.stop(torrent.id, function(err, data) {

           });
           this.client.remove(torrent.id, function(err, data) {

           });
       }
    }.bind(this));
};

Downloads.prototype.refresh = function() {
    return this.client.get(function(err, arg) {
        this.emit('status', arg.torrents);
    }.bind(this));
};

module.exports = Downloads;
