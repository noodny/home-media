define([
    'collections/radio',
    'socket',
    'text!templates/radio.html',
    'text!templates/radio/list-item.html'
], function(RadioCollection, Socket, viewTemplate, itemTemplate) {
    var MoviesView = Backbone.View.extend({
        events: {
            'click .item-play': 'onItemPlayClick'
        },
        initialize: function() {
            this.collection = new RadioCollection();
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
            this.$list = this.$('#radio-list');
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

            Socket.emit('player:open', {
                type: 'radio',
                id: $(event.currentTarget).data('id')
            });
        }
    });
    return MoviesView;
});
