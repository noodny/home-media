define([
    'socket',
    'collections/downloads',
    'views/downloads/search',
    'text!templates/downloads.html',
    'text!templates/downloads/list-item.html'
], function(Socket, DownloadsCollection, SearchView, viewTemplate, itemTemplate) {
    var DownloadsView = Backbone.View.extend({
        events: {
            'click .item-toggle': 'onItemToggleClick',
            'click .item-remove': 'onItemRemoveClick'
        },
        initialize: function(settings, options) {
            this.collection = new DownloadsCollection();
            if(options.query) {
                this.query = options.query;
            }
        },
        destroy: function() {
            this.searchSubView.undelegateEvents();
            this.searchSubView.stopListening();
            this.searchSubView.$el.empty();

            if(this.searchSubView.destroy) {
                this.searchSubView.destroy();
            }
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
            this.$list = this.$('#downloads-list');
            this.collection.fetch().done(this.onCollectionFetch.bind(this));
            this.renderSearchView();
        },
        renderSearchView: function() {
            var $el = this.$('#downloads-search');
            this.searchSubView = new SearchView({
                el: $el
            }, {
                query: this.query || null
            });
            this.searchSubView.render();
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

            Socket.socket.on('downloads:status', function(data) {
                this.collection.set(data, {parse: true});
            }.bind(this));
        },
        onItemToggleClick: function(event) {
            event.preventDefault();

            var $el = $(event.currentTarget),
                id = $el.parents('.list-group-item').data('id'),
                model = this.collection.get(id),
                event = model.isActive() ? 'stop' : 'start';

            $el.addClass('loading');
            Socket.emit('downloads:' + event, id);
        },
        onItemRemoveClick: function(event) {
            event.preventDefault();

            var $el = $(event.currentTarget),
                id = $el.parents('.list-group-item').data('id');

            this.collection.remove(this.collection.get(id));

            $el.addClass('loading');
            Socket.emit('downloads:remove', id);
        }
    });
    return DownloadsView;
});
