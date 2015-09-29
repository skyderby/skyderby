Skyderby.views.RoundMapView = Backbone.View.extend({

    template:                JST['app/templates/round_map_view/form'],
    round_row_template:      JST['app/templates/round_map_view/round_row'],
    competitor_row_template: JST['app/templates/round_map_view/competitor_row'],

    tagName: 'div',

    className: 'modal-dialog modal-lg',

    events: {
        // 'click tr'                     : 'on_row_click',
        // 'change input[type="checkbox"]': 'on_toggle_checkbox'
    },

    colors: [
        "#7cb5ec",
        "#434348", 
        "#90ed7d", 
        "#f7a35c", 
        "#8085e9", 
        "#f15c80", 
        "#e4d354", 
        "#8085e8", 
        "#8d4653", 
        "#91e8e1"
    ],

    competitors: {},

    initialize: function(opts) {
        this.modalView = new Skyderby.views.ModalView();
    },

    render: function() {
        this.$el.html(this.template({
            title: I18n.t('events.show.round_map_view')
        }));

        this.modalView.$el.html(this.$el);

        this.listenTo(this.modalView, 'modal:shown', this.onModalShown);
        this.listenTo(this.modalView, 'modal:hidden', this.onModalHidden);

        var center = new google.maps.LatLng(26.703115, 22.085180);
        var options = {
            'zoom': 2,
            // 'center': center,
            'mapTypeId': google.maps.MapTypeId.ROADMAP
        };

        this.map = new google.maps.Map(this.$('#round-map')[0], options);

        this.render_competitors();

        return this;
    },

    open: function() {
        this.modalView.show();
        
        $.get(this.model.url() + '/map_data', this.on_receive_map_data.bind(this));

        return this;
    },

    onModalShown: function() {
        google.maps.event.trigger(this.map, "resize");
    },

    onModalHidden: function() {
        this.$el.remove();
    },

    render_competitors: function() {
        var competitors_by_sections = window.Competition.competitors.groupBy('section_id');

        for (var section_id in competitors_by_sections) {
            var tbody = $('<tbody>');
            var section_name = window.Competition.sections.get(section_id).get('name');

            tbody.append(this.round_row_template({name: section_name}));

            var competitors = competitors_by_sections[section_id];
            for (var index in competitors) {
                var competitor = competitors[index];
                var competitor_row = this.competitor_row_template({
                    id: competitor.id,
                    name: competitor.get('profile').name
                });
                tbody.append(competitor_row);
            }
            this.$('.round-competitors').append(tbody);
        }
    },

    // on_row_click: function(e) {
    //     if ($(e.toElement).is('input')) return;
    //
    //     var checkbox = $(e.currentTarget).find('input[type="checkbox"]');
    //     if (checkbox.length) {
    //         checkbox.prop('checked', !checkbox.is(':checked')).trigger('change');
    //     }
    // },

    // on_toggle_checkbox: function(e) {
    //     var elem = $(e.currentTarget);
    //     if (elem.parent().hasClass('round-map-round')) {
    //
    //     }
    // },

    on_receive_map_data: function(data) {
        var lat_bounds = [], lon_bounds = [];

        var color_index = 0;
        var start_window, end_window, prev_point, track_direction;

        for (var competitor_id in data) {

            start_window = undefined;
            end_window = undefined;

            var path_coordinates = [];
            var track_points = data[competitor_id].points;
            for (var point_index in track_points) {
                var point = track_points[point_index];
                path_coordinates.push({
                    'lat': Number(point.latitude),
                    'lng': Number(point.longitude)
                });

                if (!start_window && point.altitude <= window.Competition.get('range_from')) {
                    if (point_index > 0) {
                        prev_point = track_points[point_index - 1];
                        start_window = Skyderby.helpers.pointInterpolation(
                            point, 
                            prev_point, 
                            this.interpolation_coeff(point, prev_point, window.Competition.get('range_from'))
                        );
                    } else {
                        start_window = point;
                    }
                }

                if (!end_window && point.altitude <= window.Competition.get('range_to')) {
                    if (point_index > 0) {
                        prev_point = track_points[point_index - 1];
                        end_window = Skyderby.helpers.pointInterpolation(
                            point, 
                            prev_point, 
                            this.interpolation_coeff(point, prev_point, window.Competition.get('range_to'))
                        );
                    } else {
                        end_window = point;
                    }
                }
            } 

            var current_color = this.colors[color_index];
            var polyline = new google.maps.Polyline({
                path: path_coordinates,
                strokeColor: current_color,
                strokeOpacity: 1, 
                strokeWeight: 3
            });

            polyline.setMap(this.map);

            if (start_window) {
                new google.maps.Marker({
                    position: {
                        lat: Number(start_window.latitude),
                        lng: Number(start_window.longitude)
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        strokeWeight: 5,
                        fillColor: '#ff1053',
                        strokeColor: '#ff1053',
                        fillOpacity: 1
                    },
                    map: this.map
                });
            }

            if (end_window) {
                new google.maps.Marker({
                    position: {
                        lat: Number(end_window.latitude),
                        lng: Number(end_window.longitude)
                    },
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        strokeWeight: 5,
                        fillColor: '#5FAD41',
                        strokeColor: '#5FAD41',
                        fillOpacity: 1
                    },
                    map: this.map
                });
            }

            if (start_window && end_window) {
                track_direction = Skyderby.helpers.trackDirection(start_window, end_window);
                this.$('#track-direction-c' + competitor_id).text(Math.round(track_direction) + '°');
            }

            var lats = _.pluck(track_points, 'latitude').sort();
            var lons = _.pluck(track_points, 'longitude').sort();

            lat_bounds.push(lats[0]);
            lat_bounds.push(lats[lats.length - 1]);

            lon_bounds.push(lons[0]);
            lon_bounds.push(lons[lons.length - 1]);

            var cell = this.$('#round-map-c' + competitor_id);
            cell.append($('<i>').addClass('fa fa-circle').css('color', current_color));
            cell.parent().removeClass('disabled');
            // cell.find('input').prop('checked', true);

            color_index += 1; 
        }

        lat_bounds.sort();
        lon_bounds.sort();

        var bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(
            Number(lat_bounds[0]), 
            Number(lon_bounds[0])
        ));

        bounds.extend(new google.maps.LatLng(
            Number(lat_bounds[lat_bounds.length - 1]),
            Number(lon_bounds[lon_bounds.length - 1])
        ));

        google.maps.event.trigger(this.map, "resize");
        this.map.fitBounds(bounds);
        this.map.setCenter(bounds.getCenter());

        this.$('.round-map-loading').hide();

    },

    interpolation_coeff: function(first, last, altitude) {
      return (first.altitude - altitude) / (first.altitude - last.altitude);
    }
});
