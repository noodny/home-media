define(['utils'], function(utils) {
    var Download = Backbone.Model.extend({
        defaults: {},
        getRating: function() {
            return Math.round(this.get('rating') * 10) + '/10';
        }
    });
    return Download;
});
