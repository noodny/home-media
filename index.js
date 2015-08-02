var fs = require('fs'),
    Server = require(__dirname + '/app/server.js'),
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

new Server(config);
