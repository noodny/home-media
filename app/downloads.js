var EventEmitter = require('events').EventEmitter,
    Transmission = require('transmission'),
    _ = require('lodash'),
    kickass = require('kickass-torrent'),
    config = require('../config.json');

var Downloads = function() {
    this.client = new Transmission({
        host: '192.168.0.104',
        port: 9091
    });

    this.on('status', this.checkFinished);

    this.refresh();
    setInterval(this.refresh.bind(this), 5000);
};

Downloads.prototype = Object.create(EventEmitter.prototype);

Downloads.prototype.checkFinished = function(torrents) {
    var now = Math.round(new Date().getTime()/1000);
    torrents.forEach(function(torrent) {
        if(torrent.percentDone === 1 && torrent.doneDate !== 0 && torrent.doneDate > now - config.serverTimeDiff || 0) {
            this.emit('finished', torrent);
            this.stop(torrent.id);
        }
    }.bind(this));
};

Downloads.prototype.refresh = function() {
    this.client.get(function(err, arg) {
        this.torrents = arg.torrents;
        this.emit('status', arg.torrents);
    }.bind(this));
};

Downloads.prototype.remove = function(id) {
    var torrent = _.find(this.torrents, {id: id}),
        removeFiles = (torrent.percentDone < 1);
    return this.client.remove(id, removeFiles, function(err, arg) {
        if(err) {
            this.emit('error', err);
        } else {
            this.refresh();
        }
    }.bind(this));
};

Downloads.prototype.get = function() {
    return this.torrents || [];
};

Downloads.prototype.start = function(id) {
    this.client.start(id, function(err, data) {
        if(err) {
            this.emit('error', err);
        } else {
            //this.refresh();
        }
    }.bind(this));
};

Downloads.prototype.stop = function(id) {
    this.client.stop(id, function(err, data) {
        if(err) {
            this.emit('error', err);
        } else {
            //this.refresh();
        }
    }.bind(this));
};

Downloads.prototype.search = function(query, callback) {
    if(query.length === 0) {
        return callback([]);
    }

    kickass({
        q: query,
        field: 'seeders',
        order: 'desc',
        page: 1
    }, function(err, response) {
        if(response.list) {
            callback(response.list);
        } else {
            throw new Error(err);
        }
    });

};

Downloads.prototype.add = function(params, callback) {
    if(_.find(this.torrents, {hashString: params.hash})) {
        callback({
            status: 404,
            message: 'This torrent is already on the download list.'
        });
    } else {
        this.client.addUrl(params.url, function(err, data) {
            this.refresh();
            callback(err, data);
        }.bind(this));
    }
};

module.exports = Downloads;
