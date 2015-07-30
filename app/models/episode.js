var Model = require('./../model.js'),
    Db = require('./../database.js');

var Episode = Model.extend({
    defaults: {
        id: null,
        seriesId: null,
        title: null,
        season: null,
        episode: null,
        file: null,
        overview: null,
        rating: 0,
        released: null,
        images: []
    },
    parse: function(data) {
        return {
            id: data.id,
            seriesId: data.seriesId,
            title: data.name,
            season: data.season_number,
            episode: data.episode_number,
            file: data._src.location + data._src.filename,
            duration: data._src.duration,
            overview: data.overview,
            rating: data.vote_average/10,
            released: data.air_date,
            images: {
                still: data.still_path
            }
        };
    },
    save: function() {
        Db.insert('episodes', this.toJSON());
    }
});

module.exports = Episode;
