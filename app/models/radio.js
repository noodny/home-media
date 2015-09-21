var _ = require('lodash'),
    md5 = require('md5');

var Model = require('./../model.js'),
    Db = require('./../database.js');

var Radio = Model.extend({
    defaults: {
        id: null,
        title: null,
        streams: null
    },
    parse: function(data) {
        console.log(data, md5(data.title))
        return {
            id: data.id || md5(data.title),
            title: data.title,
            streams: data.streams || [],
            image: data.image || null
        };
    },
    save: function() {
        Db.insert('radios', this.toJSON());
    }
});

module.exports = Radio;
