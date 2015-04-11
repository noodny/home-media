define([
    'views/library',
    'views/downloads',
    'views/error'
], function(LibraryView, DownloadsView, ErrorView) {
    var Router = Backbone.Router.extend({
        routes: {
            "": "home",
            "!": "home",
            "!/": "home",
            "!/library": "library",
            "!/downloads": "downloads",
            "*error": "error"
        },

        start: function() {
            Backbone.history.start();
        },

        home: function() {
            this.navigate.bind(this, '!/library', {
                replace: true,
                trigger: true
            });
        },

        library: function() {
            this.trigger('viewChange', LibraryView);
        },

        downloads: function() {
            this.trigger('viewChange', DownloadsView);
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
