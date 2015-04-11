var Terminal,
    bash = require('child_process'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');

Terminal = function () {
    this.initialize = function () {
        this.bash = bash.spawn('bash');
        this.bash.stdout.on('data', function (data) {
            this.emit('stdout', data);
        }.bind(this));
        this.bash.stdout.on('error', function (data) {
            this.emit('stderr', data);
        }.bind(this));
        this.bash.stdout.on('exit', function (code) {
            this.emit('exit', code);
        }.bind(this));
    };

    this.cmd = function (command, callback) {
        if(callback) {
            this.once('stdout', callback);
        }
        return this.bash.stdin.write(command + '\n');
    };

    this.initialize();
};

util.inherits(Terminal, EventEmitter);

module.exports = Terminal;
