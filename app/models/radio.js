var _ = require('lodash'),
    md5 = require('md5');

var Model = require('./../model.js'),
    Db = require('./../database.js');

var Radio = Model.extend({
    defaults: {
        id: null,
        title: null,
        stream: null
    },
    parse: function(data) {
        return {
            id: data.id || md5(data.title),
            title: data.title,
            stream: data.stream || "",
            image: data.image || null
        };
    },
    save: function() {
        Db.insert('radios', this.toJSON());
    }
});

module.exports = Radio;
