define([
    'config',
    'socket',
    'models/radio'
], function(config, Socket, Radio) {
    var RadiosCollection = Backbone.Collection.extend({
        model: Radio,
        url: config.apiUrl + 'radios'
    });
    return RadiosCollection;
});
