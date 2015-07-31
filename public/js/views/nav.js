define([
    'socket',
    'text!templates/nav.html'
], function(Socket, viewTemplate) {
    var NavView = Backbone.View.extend({
        events: {
            'click .update-library': 'onUpdateLibraryClick'
        },
        initialize: function() {
            this.routes = [
                {
                    label: 'Movies',
                    href: '#!/movies'
                },
                {
                    label: 'Series',
                    href: '#!/series'
                },
                {
                    label: 'Downloads',
                    href: '#!/downloads'
                }
            ];
            this.on('route', this.check, this);
        },
        render: function() {
            this.$el.html(_.template(viewTemplate, {
                brand: 'Home Media Center',
                routes: this.routes
            }));
            this.$list = this.$('.navbar-nav li');
        },
        check: function() {
            this.$list.removeClass('active').each(function(index, el){
                var $el = $(el),
                    href = $el.find('a').attr('href');

                if(window.location.hash.indexOf(href) > -1) {
                    $el.addClass('active');
                }
            })
        },
        onUpdateLibraryClick: function(event) {
            event.preventDefault();
            Socket.emit('library:update:force');
            Socket.on('library:update:finish', function() {
                window.location.reload();
            });
        }
    });
    return NavView;
});
