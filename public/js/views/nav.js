define([
    'text!templates/nav.html'
], function(viewTemplate) {
    var NavView = Backbone.View.extend({
        initialize: function() {
            this.routes = [
                {
                    label: 'Movies',
                    href: '#!/movies'
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
        }
    });
    return NavView;
});
