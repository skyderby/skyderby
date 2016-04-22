Skyderby.models.Event = Backbone.Model.extend({

    paramRoot: 'event',

    defaults: {
        name: '',
        range_from: 3000,
        range_to: 2000,
        status: 'draft',
        rules: 'speed_distance_time',
        is_official: false,
        wind_cancellation: false
    },

    permitted_params: [
        'name', 
        'starts_at',
        'rules',
        'place_id',
        'range_from',
        'range_to',
        'status',
        'wind_cancellation'
    ],

    max_results: {},

    initialize: function() {
        this.url = '/' + I18n.currentLocale() + '/events/' + this.id;

        this.sections     = new Skyderby.collections.Sections({parent_url: this.url});
        this.competitors  = new Skyderby.collections.Competitors({parent_url: this.url});
        this.rounds       = new Skyderby.collections.Rounds({parent_url: this.url});
        this.tracks       = new Skyderby.collections.EventTracks({parent_url: this.url});
        this.organizers   = new Skyderby.collections.EventOrganizers({parent_url: this.url});
        this.sponsors     = new Skyderby.collections.Sponsors({parent_url: this.url});
        this.weather_data = new Skyderby.collections.WeatherData({parent_url: this.url});

        this.tracks.on('add remove reset', this.update_max_results.bind(this));

        this.sections.set(this.get('sections'));
        this.competitors.set(this.get('competitors'));
        this.rounds.set(this.get('rounds'));
        this.tracks.set(this.get('tracks'));
        this.sponsors.set(this.get('sponsors'));
        this.organizers.set(this.get('organizers'));
        this.weather_data.set(this.get('weather_data'));

        // Add responsible to organizers
        var organizer_model = new Skyderby.models.EventOrganizer({allow_delete: false});
        organizer_model.set('user_profile_name', this.get('responsible').name);
        this.organizers.add(organizer_model);
    },

    save: function(attrs, options) {
        if (!options) options = {};
        if (!attrs) attrs = _.clone(this.attributes);

        // Filter the data to send to the server
        attrs = _.pick(attrs, this.permitted_params);

        var data = {};
        data[this.paramRoot] = attrs;

        options.contentType = "application/json";
        options.data = JSON.stringify(data);

        // Proxy the call to the original save function
        return Backbone.Model.prototype.save.call(this, {}, options);
    },

    update_max_results: function() {
        var result_field = this.get('wind_cancellation') ? 'result_net' : 'result'

        var max_results_array = this.tracks.chain()
            .map(function(el) {
                return {round_id: el.get('round_id'), result: el.get(result_field)};
            })
            .groupBy('round_id')
            .map(function(value, key) {
                return {round_id: key, result: _.max(_.pluck(value, 'result'))};
            }).value();

        this.max_results = {};
        for (var i = 0; i < max_results_array.length; i++) {
            var elem = max_results_array[i];
            this.max_results[elem.round_id] = elem.result;   
        }
    },

});
