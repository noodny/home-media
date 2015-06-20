define(['utils'], function(utils) {
    var Download = Backbone.Model.extend({
        defaults: {},
        parse: function(data) {
            return {
                title: data.title,
                id: data.id,
                rating: Math.round(data.vote_average * 100)/100,
                thumbnail: data.poster_path
            }
        }
    });
    return Download;
});
