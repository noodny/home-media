var opensubtitles = require('opensubtitles-client'),
    videoExtensions = ['avi', 'mov', 'mkv', 'mp4'];

module.exports = {
    download: function(torrent) {
        var dir = torrent.downloadDir,
            filename;

        torrent.files.forEach(function(){

        });

        opensubtitles.api.login().then(function(token) {
            console.log(token);

            opensubtitles.api.searchForFile(token, 'pol', path + filename)
                .then(function(results) {
                    console.log(results)
                    //got the search results
                });

            opensubtitles.api.searchForTitle(token, 'pol', filename)
                .then(function(results) {
                    console.log(results)
                });
        });
    }
};
