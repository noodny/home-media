define([
    'config',
    'socket',
    'models/series'
], function(config, Socket, Series) {
    var MoviesCollection = Backbone.Collection.extend({
        model: Series,
        url: config.apiUrl + 'library/series'
    });
    return MoviesCollection;
});
