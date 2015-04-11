define([
    'collections/movies',
    'socket',
    'text!templates/movies.html',
    'text!templates/movies/list-item.html'
], function(MoviesCollection, Socket, viewTemplate, itemTemplate) {
    var MoviesView = Backbone.View.extend({
        events: {
            'click .item-play': 'onItemPlayClick'
        },
        initialize: function() {
            this.collection = new MoviesCollection();
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
            this.$list = this.$('#movies-list');
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
