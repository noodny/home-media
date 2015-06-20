var Model = require('./../model.js'),
    Db = require('./../database.js');

var Series = Model.extend({
    defaults: {
        id: null,
        title: null,
        overview: null,
        searchKey: null,
        rating: 0,
        released: null,
        images: []
    },
    parse: function(data) {
        return {
            id: data.id,
            title: data.name,
            overview: data.overview,
            searchKey: data.searchKey,
            rating: data.vote_average / 10,
            released: data.first_air_date,
            images: {
                poster: data.poster_path,
                background: data.backdrop_path
            }
        };
    },
    save: function() {
        Db.insert('series', this.toJSON());
    }
});

module.exports = Series;
