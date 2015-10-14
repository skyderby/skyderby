Skyderby.views.TrackEditView = Backbone.View.extend({

    suit_mode: 'select',
    place_mode: 'select',
    pilot_mode: 'select',

    events: {
        'click .toggle-suit'         : 'on_toggle_suit_mode',
        'click .toggle-place'        : 'on_toggle_place_mode',
        'click .toggle-profile'      : 'on_toggle_pilot_mode',
        'click input[type="submit"]' : 'on_click_submit'
    },

    initialize: function() {
        this.on('change:suit_mode', this.on_suit_mode_change);
        this.on('change:place_mode', this.on_place_mode_change);
        this.on('change:pilot_mode', this.on_pilot_mode_change);

        this.listenTo(this.model, 'change:range_from change:range_to', this.set_plot_bands);

        if (!this.model.get('pilot')) this.pilot_mode = 'input';
        if (!this.model.get('place')) this.place_mode = 'input';
        if (!this.model.get('suit')) this.suit_mode = 'input';
    },

    render: function() {

        this.init_pilot_select();
        this.init_suit_select();
        this.init_place_select();
        
        this.init_form_validation();

        this.init_chart();

        this.init_range_selector();
        this.set_plot_bands();

        this.on_suit_mode_change();
        this.on_place_mode_change();
        this.on_pilot_mode_change();

    },

    init_suit_select: function() {
        var select_field = this.$('select[name="track[wingsuit_id]"]');
        var suit = this.model.get('suit');
        if (suit && suit.id) {
            var option = $('<option/>', { value: suit.id, text: suit.name });
            select_field.append(option);
            select_field.append($('<option />', { value: '' }));
        }

        new Skyderby.helpers.SuitSelect(select_field);
    },

    init_place_select: function() {
        var select_field = this.$('select[name="track[place_id]"]');

        var place = this.model.get('place');
        if (place && place.id) {
            var option = $('<option />', { value: place.id, text: place.name }); 
            select_field.append(option);
            select_field.append($('<option />', { value: '' }));
        }

        select_field.select2({
            theme: 'bootstrap',
            width: '100%',
            placeholder: I18n.t('tracks.form.place_select_placeholder'),
            allowClear: true,
            ajax: {
                url: '/places',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    return {
                        query: term
                    };
                },
                processResults: function (data) {
                    var places_data = _.chain(data)
                        .map(function(obj) {
                            return {
                                id: obj.id,
                                text: obj.name,
                                msl: obj.msl,
                                country: obj.country.name
                            };
                        })
                        .groupBy(function(obj) { 
                            return obj.country;
                        })
                        .map(function(obj, key) {
                            return {
                                text: key, 
                                children: obj
                            };
                        })
                        .sortBy(function(obj) {
                            return obj.text;
                        })
                        .value();
                    return { results: places_data };
                },
                cache: true
            }
        });

    },

    init_pilot_select: function() {
        var select_field = this.$('select[name="track[user_profile_id]"]');

        if (select_field.length === 0) return;

        var pilot = this.model.get('pilot');
        if (pilot && pilot.id) {
            var option = $('<option />', { value: pilot.id, text: pilot.name });
            select_field.append(option);
            select_field.append($('<option />', { value: '' }));
        }

        Skyderby.helpers.PilotSelect(select_field);
    },

    init_form_validation: function() {
        this.$('#track_edit_form').validate({
            ignore: 'input[type=hidden]',
            groups: {
                suit: 'track[wingsuit_id] track[suit]',
                place: 'track[place_id] track[location]'
            },
            rules: {
                'track[wingsuit_id]': {
                    require_from_group: [1, '.suit-group']
                },
                'track[suit]': {
                    require_from_group: [1, '.suit-group']
                },
                'track[place_id]': {
                    require_from_group: [1, '.place-group']
                },
                'track[location]': {
                    require_from_group: [1, '.place-group']
                },
            },
            messages: {
                'track[suit]': {
                    require_from_group: I18n.t('jquery_validate.required_field')
                },
                'track[location]': {
                    require_from_group: I18n.t('jquery_validate.required_field')
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorPlacement: function(error, element) {
                if (element.hasClass('suit-group') || element.hasClass('place-group')) {
                    error.appendTo( element.closest('div') );    
                } else {
                    error.insertAfter(element);
                }
            }
        });

    },

    init_chart: function() {
        this.$('#heights-chart').highcharts({
            chart: {
                type: 'area'
            },
            title: {
                text: I18n.t('tracks.edit.elev_chart')
            },
            plotOptions: {
                series: {
                    marker: {
                        radius: 1
                    }
                }
            },
            yAxis: {
                title: {
                    text: I18n.t('tracks.edit.elevation') + ', ' + I18n.t('units.m')
                }
            },
            xAxis: {
                plotBands: [{
                    color: 'gray',
                    from: 0,
                    to: 0,
                    id: 'plotband-start'
                },
                {
                    color: 'gray',
                    from: 0,
                    to: 0,
                    id: 'plotband-end'
                },
                ]},
                tooltip: {
                    crosshairs: true
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: I18n.t('tracks.edit.elevation'),
                    pointInterval: 10,
                    tooltip: {
                        valueSuffix: I18n.t('units.m')
                    },
                    data: this.model.get('points')
                }]
            }
        );
    },

    init_range_selector: function() {
        var model = this.model;
        $("#time-selector").ionRangeSlider({
            min: 0,
            max: model.get('max_rel_time'),
            type: 'double',
            step: 1,
            prettify: false,
            hasGrid: true,
            from: model.get('range_from'),
            to: model.get('range_to'),
            onChange: function (obj) {
                model.set('range_from', obj.fromNumber);
                model.set('range_to', obj.toNumber);
            }
        });
    },

    set_plot_bands: function() {
        var chart = $('#heights-chart').highcharts();
        chart.xAxis[0].removePlotBand('plotband-start');
        chart.xAxis[0].removePlotBand('plotband-end');

        chart.xAxis[0].addPlotBand({
            from: 0,
            to: this.model.get('range_from'),
            color: 'gray',
            id: 'plotband-start'
        });

        chart.xAxis[0].addPlotBand({
            from: this.model.get('range_to'),
            to: this.model.get('max_rel_time'),
            color: 'gray',
            id: 'plotband-end'
        });

        $('#ff_start').val(this.model.get('range_from'));
        $('#ff_end').val(this.model.get('range_to'));
    },

    on_toggle_suit_mode: function(e) {
        e.preventDefault();

        if (this.suit_mode === 'select') {
            this.suit_mode = 'input';
        } else {
            this.suit_mode = 'select';
        }

        this.trigger('change:suit_mode');
    },

    on_toggle_place_mode: function(e) {
        e.preventDefault();

        if (this.place_mode === 'select') {
            this.place_mode = 'input';
        } else {
            this.place_mode = 'select';
        }

        this.trigger('change:place_mode');
    },

    on_toggle_pilot_mode: function(e) {
        e.preventDefault();

        if (this.pilot_mode === 'select') {
            this.pilot_mode = 'input';
        } else {
            this.pilot_mode = 'select';
        }

        this.trigger('change:pilot_mode');
    },

    on_suit_mode_change: function() {
        var link = this.$('.toggle-suit');
        var caption = this.$('.toggle-suit-caption');        
        var input = this.$('input[name="track[suit]"]');
        var select_el = this.$('select[name="track[wingsuit_id]"] + span');

        if (this.suit_mode === 'select') {
            link.text(I18n.t('tracks.form.toggle_suit_link'));
            caption.text(I18n.t('tracks.form.toggle_suit_caption'));
            input.hide();
            select_el.show();
        } else {
            link.text(I18n.t('tracks.form.toggle_suit_link_select'));
            caption.text(I18n.t('tracks.form.toggle_suit_caption_select'));
            input.show();
            select_el.hide();
        }
    },

    on_place_mode_change: function() {
        var link = this.$('.toggle-place');
        var caption = this.$('.toggle-place-caption');        
        var input = this.$('input[name="track[location]"]');
        var select_el = this.$('select[name="track[place_id]"] + span');

        if (this.place_mode === 'select') {
            link.text(I18n.t('tracks.form.toggle_place_link'));
            caption.text(I18n.t('tracks.form.toggle_place_caption'));
            input.hide();
            select_el.show();
        } else {
            link.text(I18n.t('tracks.form.toggle_place_link_select'));
            caption.text(I18n.t('tracks.form.toggle_place_caption_select'));
            input.show();
            select_el.hide();
        }
 
    },

    on_pilot_mode_change: function() {
        var link = this.$('.toggle-profile');
        var caption = this.$('.toggle-profile-caption');        
        var input = this.$('input[name="track[name]"]');
        var select_el = this.$('select[name="track[user_profile_id]"] + span');

        if (this.pilot_mode === 'select') {
            link.text(I18n.t('tracks.form.toggle_profile_link'));
            caption.text(I18n.t('tracks.form.toggle_profile_caption'));
            input.hide();
            select_el.show();
        } else {
            link.text(I18n.t('tracks.form.toggle_profile_link_select'));
            caption.text(I18n.t('tracks.form.toggle_profile_caption_select'));
            input.show();
            select_el.hide();
        }
    },

    on_click_submit: function() {
        if (this.suit_mode === 'select') {
            this.$('input[name="track[suit]"]').val('');
        } else {
            this.$('select[name="track[wingsuit_id]"]').val('');
        }

        if (this.place_mode === 'select') {
            this.$('input[name="track[location]"]').val('');
        } else {
            this.$('select[name="track[place_id]"]').val('');
        }

        if (this.pilot_mode === 'select') {
            this.$('input[name="track[name]"]').val();
        } else {
            this.$('select[name="track[user_profile_id]"]').val('');
        }
    }
});
