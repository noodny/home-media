define([
    'views/movies',
    'views/series',
    'views/episodes',
    'views/downloads',
    'views/error'
], function(MoviesView, SeriesView, EpisodesView, DownloadsView, ErrorView) {
    var Router = Backbone.Router.extend({
        routes: {
            "": "home",
            "!": "home",
            "!/": "home",
            "!/movies": "movies",
            "!/series": "series",
            "!/series/:id/episodes": "episodes",
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

        series: function() {
            this.trigger('viewChange', SeriesView);
        },

        episodes: function(seriesId) {
            this.trigger('viewChange', EpisodesView, {
                seriesId: seriesId
            });
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
