define(['utils'], function(utils) {
    var Download = Backbone.Model.extend({
        defaults: {},
        parse: function(data) {
            return {
                title: data.label,
                id: data.movieid,
                rating: Math.round(data.rating * 100)/100,
                thumbnail: this.parseImageUrl(data.thumbnail),
                imdb: data.imdbnumber
            }
        },
        parseImageUrl: function(url) {
            url = url.replace('image://', 'http://192.168.0.104:8080/image/');
            url = url.substr(0, url.length - 1);
            return url;
        }
    });
    return Download;
});
