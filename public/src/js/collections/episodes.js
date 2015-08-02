define([
    'config',
    'socket',
    'models/episode'
], function(config, Socket, Episode) {
    var MoviesCollection = Backbone.Collection.extend({
        model: Episode,
        url: function() {
            return config.apiUrl + 'library/series/' + this.seriesId + '/episodes'
        },
        initialize: function(options) {
            if(options && options.seriesId) {
                this.seriesId = options.seriesId;
            }
        }
    });
    return MoviesCollection;
});
