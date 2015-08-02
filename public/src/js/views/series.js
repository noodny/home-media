define([
    'collections/series',
    'socket',
    'text!templates/series.html',
    'text!templates/series/list-item.html'
], function(SeriesCollection, Socket, viewTemplate, itemTemplate) {
    var MoviesView = Backbone.View.extend({
        events: {
        },
        initialize: function() {
            this.collection = new SeriesCollection();
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
            this.$list = this.$('#series-list');
            this.collection.fetch().done(this.onCollectionFetch.bind(this));
        },
        renderElements: function() {
            var html = '';
            this.collection.each(function(download) {
                html += _.template(itemTemplate, {model: download});
            });
            this.$list.html(html);
        },
        onCollectionFetch: function() {
            this.renderElements();

            this.listenTo(this.collection, 'change add remove', this.renderElements.bind(this));

            Socket.socket.on('movies:status', function(data) {
                this.collection.set(data, {parse: true});
            }.bind(this));
        },
        onItemPlayClick: function(event) {
            event.preventDefault();

            Socket.emit('player:open', $(event.currentTarget).data('id'));
        }
    });
    return MoviesView;
});
