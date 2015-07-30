define([
    'socket',
    'text!templates/update.html'
], function(Socket, template) {
    var UpdateView = Backbone.View.extend({
        initialize: function() {
            Socket.socket.on('library:update:start', this.show.bind(this));
            Socket.socket.on('library:update:finish', function() {
                window.location.reload();
            });
            Socket.socket.on('library:update:progress', this.onProgress.bind(this));
        },
        render: function() {
            this.$el.html(_.template(template));
            this.$progress = this.$('.progress-bar');
            this.$percent = this.$('.percent');
        },
        show: function() {
            this.$el.removeClass('hidden');
        },
        onProgress: function(ratio) {
            var percent = Math.round(ratio*100) + '%';
            this.$progress.css('width', percent);
            this.$percent.text(percent);
        }
    });
    return UpdateView;
});
