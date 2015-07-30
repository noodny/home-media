var _ = require('lodash'),
    EventEmitter = require('events').EventEmitter.prototype;

var Model = {
    set: function() {
        var attributes = {}, options, changed = {};

        if(arguments.length === 2) {
            if(_.isString(arguments[0])) {
                attributes[arguments[0]] = arguments[1];
            } else {
                attributes = arguments[0];
                options = arguments[1];
            }
        } else if(arguments.length === 3) {
            attributes[arguments[0]] = arguments[1];
            options = arguments[2];
        } else {
            attributes = arguments[0];
        }

        if(options && options.parse && _.isFunction(this.parse)) {
            attributes = this.parse(attributes);
        }

        _.each(attributes, function(value, key) {
            if(!this.attributes[key] || this.attributes[key] !== value) {
                this.attributes[key] = value;
                changed[key] = value;
            }
        }.bind(this));

        this.emit('change', changed);

        return this;
    },
    get: function(key) {
        return this.attributes[key] || null;
    },
    toJSON: function() {
        return this.attributes;
    }
};

module.exports = {
    extend: function(extension) {
        var constructor = function(attributes, options) {
            _.each(extension, function(value, key) {
                this[key] = value;
            }.bind(this));

            this.attributes = _.defaults({}, this.defaults || {});

            if(attributes) {
                this.set(attributes, options);
            }

            if(_.isFunction(this.initialize)) {
                this.initialize(attributes, options);
            }
        };

        constructor.prototype = _.extend(Model, EventEmitter);

        return constructor;
    }
};
