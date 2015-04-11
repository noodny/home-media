define(['utils'], function(utils) {
    var SearchResult = Backbone.Model.extend({
        defaults: {},
        parse: function(data) {
            return {
                name: data.title,
                date: data.pubDate,
                size: data.size,
                url: data.torrentLink,
                hash: data.hash.toLowerCase()
            };
        },
        getDate: function() {
            return utils.formatDate(this.get('date'));
        },
        getSize: function() {
            return utils.formatSize(this.get('size'));
        }
    });
    return SearchResult;
});
