var Model = require('./../model.js'),
    Db = require('./../database.js');

var Movie = Model.extend({
    defaults: {
        id: null,
        title: null,
        file: null,
        overview: null,
        rating: 0,
        released: null,
        images: []
    },
    parse: function(data) {
        return {
            id: data.id,
            title: data.name,
            file: data._src.location + data._src.filename,
            overview: data.overview,
            rating: data.vote_average/10,
            released: data.release_date,
            images: {
                poster: data.poster_path,
                background: data.backdrop_path
            }
        };
    },
    save: function() {
        Db.insert('movies', this.toJSON());
    }
});

module.exports = Movie;
