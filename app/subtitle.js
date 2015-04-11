var opensubtitles = require('opensubtitles-client');


opensubtitles.api.login()
    .then(function(token){
        console.log(token);
        // got the auth token

        //opensubtitles.api.searchForFile(token, 'pol', '/Users/krzysztofjakubik/Downloads/Mad.Men.S07E08.HDTV.x264-LOL[ettv]/mad.men.708.hdtv-lol.mp4')
        //.then(function(results){
        //        console.log(results)
        //    //got the search results
        //});

        opensubtitles.api.searchForTitle(token, 'pol', 'Mad.Men.S07E08.HDTV.x264-LOL[ettv]')
            .then(function(results){
                //console.log(results)
                //got the search results
            });
    });
