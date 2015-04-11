define([
    'views/library',
    'views/downloads',
    'views/error'
], function(LibraryView, DownloadsView, ErrorView) {
    var instance,
        Router = Backbone.Router.extend({
        routes: {
            "": "home",
            "!": "home",
            "!/": "home",
            "!/library": "library",
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

        library: function() {
            this.trigger('viewChange', LibraryView);
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
