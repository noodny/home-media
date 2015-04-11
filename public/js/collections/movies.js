define([
    'config',
    'socket',
    'models/movie'
], function(config, Socket, Movie) {
    var MoviesCollection = Backbone.Collection.extend({
        comparator: function(a, b) {
            var prA = a.get('progress'),
                prB = b.get('progress');

            if(prA === 1 || prB === 1) {
                if(prA === prB) {
                    return 0;
                }
                if(prA !== 1) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                return a.get('date') < b.get('date');
            }
        },
        model: Movie,
        url: config.apiUrl + 'movies',
        initialize: function() {
            this.on('add', function(model) {
                this.listenTo(model, 'change', this.trigger.bind(this, 'change', model));
            }.bind(this));
            this.on('remove', function(model) {
                this.stopListening(model, 'change');
            }.bind(this));
        }
    });
    return MoviesCollection;
});
