Skyderby.views.PlacesIndex = Backbone.View.extend({

    view_type: 'map',

    initialize: function(opts) {
        if (_.has(opts, 'collection')) this.collection = opts.collection;

        this.on('change:view_type', this.set_visibility);
    },

    events: {
        'click label.toggle-view-type': 'on_toggle_view_type'
    },

    render: function() {
        this.set_visibility();
        this.listenToOnce(window.Skyderby, 'maps_api:ready', this.on_maps_api_ready);
        window.Skyderby.helpers.init_maps_api();
    },

    on_maps_api_ready: function() {
        var center = new google.maps.LatLng(26.703115, 22.085180);

        var options = {
            'zoom': 2,
            'center': center,
            'mapTypeId': google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(this.$('#places-map')[0], options);
        var markers = [];
        var template = JST['app/templates/place_infowindow'];

        google.maps.InfoWindow.prototype.opened = false;

        this.collection.each(function(place) {
            
            var latLng = new google.maps.LatLng(
                place.get('latitude'),
                place.get('longitude')
            );

            var marker = new google.maps.Marker({
                position: latLng,
                title: place.get('title')
            });

            markers.push(marker);

            var content = template(place.toJSON());
            var info_window = new google.maps.InfoWindow({
                content: content
            });

            google.maps.event.addListener(marker, 'click', function() {
                if (info_window.opened) {
                    info_window.close(); 
                    info_window.opened = false;
                } else {
                    info_window.open(map, marker);
                    info_window.opened = true;
                }
            });
        });

        var mcOptions = { gridSize: 50, maxZoom: 6 };
        var markerCluster = new MarkerClusterer(map, markers, mcOptions);
    },

    on_toggle_view_type: function(e) {
        this.view_type = $(e.currentTarget).find('input:radio[name="view_type"]').val();
        this.trigger('change:view_type');
    },

    set_visibility: function() {
        var map_view = this.$('.map-view');
        var list_view = this.$('.list-view');

        if (this.view_type === 'map') {
            map_view.show();
            list_view.hide();    
        } else {
            map_view.hide();
            list_view.show();    
        }    
    }
});
