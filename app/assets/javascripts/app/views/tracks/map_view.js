Skyderby.views.TrackMapView = Backbone.View.extend({

    render: function() {
        var center = new google.maps.LatLng(26.703115, 22.085180);
        var options = {
            'zoom': 2,
            'center': center,
            'mapTypeId': google.maps.MapTypeId.ROADMAP
        };

        this.map = new google.maps.Map(this.$('#map')[0], options);

        this.draw_polyline();
    },

    draw_polyline: function() {
        var path_coordinates = [], 
            prev_point = null,
            polyline;

        var points = this.model.get('points');

        for (var index in points) {
            var current_point = points[index];
          
            if (path_coordinates.length === 0 || (this.speed_group(prev_point.h_speed) == this.speed_group(current_point.h_speed))) {
                path_coordinates.push({
                    'lat': Number(current_point.latitude),
                    'lng': Number(current_point.longitude)
                });
            } else {

                polyline = new google.maps.Polyline({
                    path: path_coordinates,
                    strokeColor: $('.hl' + this.speed_group(prev_point.h_speed)).css( "background-color" ),
                    strokeOpacity: 1, strokeWeight: 6
                });

                polyline.setMap(this.map);

                path_coordinates = [];
                path_coordinates.push({
                    'lat': Number(prev_point.latitude), 
                    'lng': Number(prev_point.longitude)
                });
            }
            prev_point = current_point;
        }

        polyline = new google.maps.Polyline({
            path: path_coordinates,
            strokeColor: $('.hl' + this.speed_group(prev_point.h_speed)).css( "background-color" ),
            strokeOpacity: 1, strokeWeight: 6
        });

        polyline.setMap(this.map);

        var bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(
            Number(points[0].latitude), 
            Number(points[0].longitude)
        ));

        bounds.extend(new google.maps.LatLng(
            Number(points[points.length - 1].latitude),
            Number(points[points.length - 1].longitude)
        ));

        this.map.fitBounds(bounds);
        this.map.setCenter(bounds.getCenter());
    },

    speed_group: function(speed) {
        if (speed > 250) {
          return 6;
        } else if (speed > 220) {
          return 5;
        } else if (speed > 190) {
          return 4;
        } else if (speed > 160) {
          return 3;
        } else if (speed > 130) {
          return 2;
        } else {
          return 1;
        }
    },

    speed_group_color: function(spd_group) {
        if (spd_group == 1) {
          return 'aa2e7e2d';
        } else if (spd_group == 2) {
          return 'aa43c042';
        } else if (spd_group == 3) {
          return 'aa34ced9';
        } else if (spd_group == 4) {
          return 'aa0f67e4';
        } else if (spd_group == 5) {
          return 'aa0c00e7';
        } else if (spd_group == 6) {
          return 'aa0c0060';
        }
    },
});
