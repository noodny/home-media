define([
    'config',
    'application',
    'collections/search-results',
    'text!templates/downloads/search.html',
    'text!templates/downloads/search-result.html'
], function(config, Application, SearchResultsCollection, viewTemplate, itemTemplate) {
    var SearchView = Backbone.View.extend({
        events: {
            'submit form': 'onFormSubmit',
            'click .reset-form': 'onResetFormClick',
            'click .download-item': 'onItemDownloadClick'
        },
        initialize: function(config, options) {
            if(options.query) {
                this.initialQuery = options.query;
            }
        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
            this.$list = this.$('#search-results .list-group');
            this.$panel = this.$('#search-results');
            this.$input = this.$('[name="query"]');

            if(this.initialQuery) {
                this.$input.val(this.initialQuery);
                this.onFormSubmit();
            }
        },
        renderElements: function() {
            var html = '';
            this.collection.each(function(download) {
                html += _.template(itemTemplate, {model: download});
            });
            this.$list.html(html).scrollTop(0);
            this.$panel.removeClass('hidden');
        },
        renderMessage: function() {
            this.$panel.addClass('hidden');
        },
        onFormSubmit: function(event) {
            if(event) {
                event.preventDefault();
            }

            var query = this.$input.val();

            this.collection = new SearchResultsCollection([], {query: query});

            if(query.length) {
                Application.router.navigate('!/downloads/search/' + query, {
                    replace: true
                });
                this.collection.fetch().done(this.onCollectionFetch.bind(this));
            } else {
                Application.router.navigate('!/downloads', {
                    replace: true
                });
                this.$panel.addClass('hidden');
                this.$list.empty();
            }
        },
        onCollectionFetch: function(data) {
            if(data.length) {
                this.renderElements();
            } else {
                this.renderMessage();
            }
        },
        onItemDownloadClick: function(event) {
            event.preventDefault();

            var $el = $(event.currentTarget);

            $.post(config.apiUrl + 'downloads/add', {
                url: $el.data('url'),
                hash: $el.data('hash')
            });
        },
        onResetFormClick: function(event) {
            event.preventDefault();
            this.$input.val('');
            this.onFormSubmit();
        }
    });
    return SearchView;
});
