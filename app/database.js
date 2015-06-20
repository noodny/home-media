var _db = require('underscore-db'),
    _ = require('lodash'),
    dbPath = './data/database.json',
    db;

_.mixin(_db);

module.exports = {
    defaults: {
        movies: [],
        series: [],
        episodes: [],
        scanned: [],
        lastScan: false
    },
    initialize: function() {
        db = this.load();
        if(!db) {
            db = _.extend(this.defaults);
            this.save();
        }
    },
    empty: function() {
        db = _.extend(this.defaults);
        this.save();
    },
    insert: function(collection, model) {
        if(!db) {
            this.initialize();
        }
        _.insert(db[collection], model);
        return this;
    },
    get: function(collection) {
        if(!db) {
            this.initialize();
        }
        return db[collection];
    },
    find: function(collection, query) {
        if(!db) {
            this.initialize();
        }
        return _.find(db[collection], query);
    },
    has: function(collection, value) {
        if(!db) {
            this.initialize();
        }
        return db[collection].indexOf(value) > -1;
    },
    set: function(key, value) {
        if(!db) {
            this.initialize();
        }
        db[key] = value;
        return this;
    },
    load: function() {
        try {
            db = _.load(dbPath);
            return db;
        } catch (e) {
            return false;
        }
    },
    save: function() {
        _.save(db, dbPath)
    }
};
