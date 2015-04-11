define([
    'text!templates/library.html'
], function(viewTemplate) {
    var LibraryView = Backbone.View.extend({
        initialize: function() {

        },
        render: function() {
            this.$el.html(_.template(viewTemplate));
        },
        renderElements: function() {

        }
    });
    return LibraryView;
});
