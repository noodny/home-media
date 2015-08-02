define([], function() {
    var utils = {
        formatTime: function(seconds) {
            return new Date(null, null, null, null, null, seconds).toTimeString().match(/\d{2}:\d{2}:\d{2}/)[0]
        },
        formatDate: function(date) {
            var now = new Date(),
                date = new Date(date),
                days = (now-date)/(1000*60*60*24);

            if(days <= 7) {
                return Math.ceil(days) + ' days ago';
            } else {
                return date.toDateString().split(' ').splice(1,3).join(' ');
            }
        },
        formatSize: function(bytes, noExt) {
            if(bytes == 0) return '0 Byte';
            var k = 1000;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toPrecision(3) + (!noExt ? ' ' + sizes[i] : '');
        }
    };
    return utils;
});
