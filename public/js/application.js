define([
    'socket',
    'message',
    'views/nav',
    'views/player',
    'views/update'
], function(Socket, Message, NavView, PlayerView, UpdateView) {
    var instance,
        Application = {
            initialize: function(router) {
                this.$body = $('body');
                this.$container = $('#container');

                this.router = router;
                this.router.on('viewChange', function(view, options) {
                    this.setCurrentView(view, options);
                    this.navView.trigger('route');
                }, this);

                Message.initialize($('#message'));

                Socket.initialize();
                Socket.socket.on('message', function(data) {
                    Message.alert({
                        title: 'Message',
                        body: data
                    });
                });

                this.navView = new NavView({
                    el: $('#navbar')
                });
                this.navView.render();

                this.playerView = new PlayerView({
                    el: $('#player')
                });
                this.playerView.render();

                this.updateView = new UpdateView({
                    el: $('#update')
                });
                this.updateView.render();

                this.router.start();
            },
            setCurrentView: function(View, options) {
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
                }, options || {});
                this.currentView.render();
            }
        };

    if(!instance) {
        instance = _.extend(Application, Backbone.Events);
    }

    return instance;
});
