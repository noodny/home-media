var Model = require('./../model.js'),
    Db = require('./../database.js');

var Media = Model.extend({
    defaults: {
        location: null,
        filename: null,
        title: null,
        year: null,
        season: null,
        episode: null
    },
    wasScanned: function() {
        return Db.has('scanned', this.getPath());
    },
    markAsScanned: function() {
        Db.insert('scanned', this.getPath());
    },
    isSeries: function() {
        return this.get('season') !== null && this.get('episode') !== null;
    },
    /**
     *  @return String - trimmed title in lower case
     */
    getSearchKey: function() {
        return this.get('title').replace(/ /g, '').toLowerCase().trim();
    },
    /**
     *  @return String - media file full path
     */
    getPath: function() {
        return this.get('location') + this.get('filename');
    },
    /**
     *  @description Perform a naive data extraction from filename
     */
    parse: function(data) {
        var filename = data.filename,
            path = filename.split('/'),
            name = path[path.length - 1];

        var skip = function(str) {
            return str.replace('1080p', '').replace('720p', '').replace('x264', '');
        };

        var title = name.match(/[a-zA-Z'\. ]*/),
            year = skip(name).match(/[^0-9]([0-9]{4})[^0-9]/),
            season = skip(name).match(/[^a-zA-Z]S([0-9]+)*/i),
            episode = skip(name).match(/[^a-zA-Z]E([0-9]+)*/i);

        if(title && title[0]) {
            title = title[0].replace(/\./g, ' ').trim();

            title = title.replace(/theatrical/i, '').replace(/bluray/i, '');

            if(title.indexOf(' S') === title.length - 2 || title.indexOf(' s') === title.length - 2) {
                title = title.substring(0, title.length - 2);
            }
        }

        if(year && year[1]) {
            year = year[1];
        }

        if(season && season[1]) {
            season = season[1];
        }

        if(episode && episode[1]) {
            episode = episode[1];
        }

        if((!season || !episode) && parseInt(year) < 1990) {
            season = year.substr(0, 2);
            episode = year.substr(2, 4);
            year = null;
        }

        // check for different combinations of season/episode notations
        if(!season || !episode) {
            var combined = skip(name).match(/([0-9]{1,2})x([0-9]{1,2})/);

            if(combined && combined.length === 3) {
                season = combined[1];
                episode = combined[2];
            } else {
                combined = skip(name).match(/[^0-9]([0-9]{3})[^0-9]/);

                if(combined && combined.length === 2) {
                    season = combined[1].substr(0, 1);
                    episode = combined[1].substr(1, 3);
                }
            }
        }

        if(year) {
            year = parseInt(year);
        }

        if(season) {
            season = parseInt(season);
        }

        if(episode) {
            episode = parseInt(episode);
        }

        return {
            location: filename.replace(name, ''),
            filename: name,
            title: title,
            year: year,
            season: season,
            episode: episode
        };
    }
});

module.exports = Media;
