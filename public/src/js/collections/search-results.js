define([
    'config',
    'models/search-result'
], function(config, SearchResult) {
    var SearchResultsCollection = Backbone.Collection.extend({
        model: SearchResult,
        query: '',
        initialize: function(models, options) {
            if(options.query) {
                this.query = options.query;
            }
        },
        url: function() {
            return config.apiUrl + 'downloads/search/' + this.query;
        }
    });
    return SearchResultsCollection;
});
