define([
    'text!templates/message.html'
], function(messageTemplate) {
    var Message = {
        initialize: function($el) {
            this.$el = $el;
        },
        create: function(options, type) {
            this.$el.html(_.template(messageTemplate, _.extend(options, {
                type: type
            })));
            this.modal = this.$el.find('#message-modal').modal({
                keyboard: true,
                show: true
            });
            this.modal.on('hidden.bs.modal', this.onClose.bind(this));
        },
        prompt: function(options, callback) {
            this.create(options, 'prompt');
            this.confirm = this.modal.find('[data-trigger="confirm"]').on('click', function() {
                this.modal.modal('hide');
                callback();
            }.bind(this));
        },
        alert: function(options) {
            this.create(options, 'alert');
        },
        onClose: function() {
            this.modal.data('bs.modal', null);
            delete this.modal;
            this.$el.empty();
        }
    };
    return Message;
});
