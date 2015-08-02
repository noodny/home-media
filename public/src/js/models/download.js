define(['utils'], function(utils) {
    var Download = Backbone.Model.extend({
        defaults: {},
        parse: function(data) {
            return {
                id: data.id,
                name: data.name,
                size: data.sizeWhenDone,
                status: (data.percentDone === 1 ? 'finished' : (data.eta === -1 ? 'paused' : 'downloading')),
                progress: data.percentDone,
                timeLeft: data.eta,
                sizeLeft: data.leftUntilDone,
                speed: data.rateDownload,
                date: data.addedDate
            }
        },
        getPercent: function() {
            return Math.round(this.get('progress') * 10000) / 100;
        },
        getTimeLeft: function() {
            return utils.formatTime(this.get('timeLeft'));
        },
        getSpeed: function() {
            return utils.formatSize(this.get('speed'));
        },
        getSizeLeft: function() {
            return;
        },
        getSize: function() {
            return utils.formatSize(this.get('size') - this.get('sizeLeft')) + '/' + utils.formatSize(this.get('size'));
        },
        isFinished: function() {
            return this.get('progress') === 1;
        },
        isActive: function() {
            return this.get('status') === 'downloading';
        }
    });
    return Download;
});
