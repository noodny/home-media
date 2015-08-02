define([
    'config',
    'socket',
    'models/download'
], function(config, Socket, Download) {
    var DownloadsCollection = Backbone.Collection.extend({
        comparator: function(a, b) {
            var prA = a.get('progress'),
                prB = b.get('progress');

            if(prA === 1 || prB === 1) {
                if(prA === prB) {
                    return 0;
                }
                if(prA !== 1) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                return a.get('date') < b.get('date');
            }
        },
        model: Download,
        url: config.apiUrl + 'downloads',
        initialize: function() {
            this.on('add', function(model) {
                this.listenTo(model, 'change', this.trigger.bind(this, 'change', model));
            }.bind(this));
            this.on('remove', function(model) {
                this.stopListening(model, 'change');
            }.bind(this));
        }
    });
    return DownloadsCollection;
});
