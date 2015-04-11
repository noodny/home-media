define([
    'views/movies',
    'views/downloads',
    'views/error'
], function(MoviesView, DownloadsView, ErrorView) {
    var Router = Backbone.Router.extend({
        routes: {
            "": "home",
            "!": "home",
            "!/": "home",
            "!/movies": "movies",
            "!/downloads(/search)(/:query)": "downloads",
            "*error": "error"
        },

        start: function() {
            Backbone.history.start();
        },

        home: function() {
            this.navigate('!/downloads', {
                replace: true,
                trigger: true
            });
        },

        movies: function() {
            this.trigger('viewChange', MoviesView);
        },

        downloads: function(query) {
            this.trigger('viewChange', DownloadsView, {
                query: query
            });
        },

        error: function() {
            this.navigate('!/404', {
                replace: true
            });
            this.trigger('viewChange', ErrorView);
        }
    });

    return Router;
});
