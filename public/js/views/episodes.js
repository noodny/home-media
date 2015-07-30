define([
    'collections/episodes',
    'socket',
    'text!templates/episodes.html',
    'text!templates/episodes/list-item.html'
], function(EpisodesCollection, Socket, viewTemplate, itemTemplate) {
    var MoviesView = Backbone.View.extend({
        events: {
            'click .item-play': 'onItemPlayClick',
            'click .item-play-continue': 'onItemContinueClick'
        },
        initialize: function(settings, options) {
            this.collection = new EpisodesCollection({
                seriesId: options.seriesId
            });
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
            this.$list = this.$('#episodes-list');
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

            Socket.emit('player:open', $(event.currentTarget).data('file'));
        },
        onItemContinueClick: function(event) {
            event.preventDefault();

            Socket.emit('player:continue', $(event.currentTarget).data('file'), $(event.currentTarget).data('time'));
        }
    });
    return MoviesView;
});
