Skyderby.models.Event = Backbone.Model.extend({

    paramRoot: 'event',

    defaults: {
        name: '',
        range_from: 3000,
        range_to: 2000,
        status: 'draft',
        rules: 'speed_distance_time',
        is_official: false
    },

    max_results: {},

    initialize: function() {
        this.url = '/' + I18n.currentLocale() + '/events/' + this.id;

        this.sections    = new Skyderby.collections.Sections({parent_url: this.url});
        this.competitors = new Skyderby.collections.Competitors({parent_url: this.url});
        this.rounds      = new Skyderby.collections.Rounds({parent_url: this.url});
        this.tracks      = new Skyderby.collections.EventTracks({parent_url: this.url});
        this.organizers  = new Skyderby.collections.EventOrganizers({parent_url: this.url});
        this.sponsors    = new Skyderby.collections.EventSponsors({parent_url: this.url});

        this.tracks.on('add remove reset', this.update_max_results.bind(this));

        this.sections.set(this.get('sections'));
        this.competitors.set(this.get('competitors'));
        this.rounds.set(this.get('rounds'));
        this.tracks.set(this.get('tracks'));
        this.sponsors.set(this.get('sponsors'));
        this.organizers.set(this.get('organizers'));

        // Add responsible to organizers
        var organizer_model = new Skyderby.models.EventOrganizer({allow_delete: false});
        organizer_model.set('user_profile_name', this.get('responsible').name);
        this.organizers.add(organizer_model);
    },

    update_max_results: function() {
        var max_results_array = this.tracks.chain()
            .map(function(el) {
                return {round_id: el.get('round_id'), result: el.get('result')};
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
