define([
    'text!templates/message.html'
], function(messageTemplate) {
    var Message = {
        initialize: function($el) {
            this.$el = $el;
        },
        prompt: function(options, callback) {
            this.$el.html(_.template(messageTemplate, _.extend(options, {
                type: 'prompt'
            })));
            this.modal = this.$el.find('#message-modal').modal({
                keyboard: true,
                show: true
            });
            this.modal.on('hidden.bs.modal', this.onClose.bind(this));
            this.confirm = this.modal.find('[data-trigger="confirm"]').on('click', function() {
                this.modal.modal('hide');
                callback();
            }.bind(this));
        },
        alert: function(message) {

        },
        onClose: function() {
            this.modal.data('bs.modal', null);
            delete this.modal;
            this.$el.empty();
        }
    };
    return Message;
});
