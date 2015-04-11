define([
], function () {
    var instance,
        Application = {
            initialize: function (router) {
                this.$body = $('body');
                this.$container = $('#content');
                this.router = router;
                this.router.on('viewChange', function (view) {
                    this.setCurrentView(view);
                }, this);

                this.router.start();
            },
            setCurrentView: function (View) {
                if(this.currentView) {
                    this.currentView.undelegateEvents();
                    this.currentView.stopListening();
                    this.$container.empty();

                    if(this.currentView.destroy) {
                        this.currentView.destroy();
                    }
                }

                this.currentView = new View({
                    el: this.$container
                });
                this.currentView.render();
            }
        };

    if(!instance) {
        instance = _.extend(Application, Backbone.Events);
    }

    return instance;
});
