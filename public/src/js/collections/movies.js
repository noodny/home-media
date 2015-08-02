define([
    'config',
    'socket',
    'models/movie'
], function(config, Socket, Movie) {
    var MoviesCollection = Backbone.Collection.extend({
        model: Movie,
        url: config.apiUrl + 'library/movies'
    });
    return MoviesCollection;
});
