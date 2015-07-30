define(['utils'], function(utils) {
    var Download = Backbone.Model.extend({
        defaults: {},
        getRating: function() {
            return Math.round(this.get('rating') * 10) + '/10';
        },
        getPosition: function() {
            return utils.formatTime(Math.round(this.get('position')));
        }
    });
    return Download;
});
