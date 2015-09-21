Skyderby.views.TrackMapView = Backbone.View.extend({

    render: function() {
        var center = new google.maps.LatLng(26.703115, 22.085180);
        var options = {
            'zoom': 2,
            'center': center,
            'mapTypeId': 'terrain'
        };

        this.map = new google.maps.Map(this.$('#map')[0], options);

        this.map.addListener('click', this.displayLocationElevation);

        this.draw_polyline();
        this.fit_bounds();
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
    },

    fit_bounds: function() {

        var points = this.model.get('points');
        var lats = _.pluck(points, 'latitude').sort();
        var lons = _.pluck(points, 'longitude').sort();

        var bounds = new google.maps.LatLngBounds();

        bounds.extend(new google.maps.LatLng(
            Number(lats[0]), 
            Number(lons[0])
        ));

        bounds.extend(new google.maps.LatLng(
            Number(lats[lats.length - 1]),
            Number(lons[lons.length - 1])
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

    displayLocationElevation: function (event) {
        var location = event.latLng;
        var elevator = new google.maps.ElevationService();
        // Initiate the location request
        elevator.getElevationForLocations({
            'locations': [location]
        }, function(results, status) {
            if (status === google.maps.ElevationStatus.OK) {
                // Retrieve the first result
                if (results[0]) {
                    console.log(
                        'Latitude: ' + location.lat().toFixed(8) + ' - ' +
                        'Longitude: ' + location.lng().toFixed(8) + ' - ' +
                        'Elevation: ' + Math.round(results[0].elevation) + ' m.');
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Elevation service failed due to: ' + status);
            }
        });
    },
});
