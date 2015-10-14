Skyderby.views.TrackIndexView = Backbone.View.extend({
    
    url_params: {},

    events: {
        'change select[name="query[profile_id]"]' : 'on_change_pilot',
        'change select[name="query[suit_id]"]' : 'on_change_suit',
        'change select[name="query[place_id]"]' : 'on_change_place'
    },

    initialize: function() {
        this.url_params = Skyderby.helpers.getUrlParams();

        this.init_pilot_select();
        this.init_suit_select();
        this.init_place_select();
    },

    render: function() {

    },

    on_change_pilot: function(e) {
        var select_field = $(e.currentTarget);
        var selected_val = select_field.find('option:selected');

        if (selected_val.val()) {
            $.extend(this.url_params, {
                'query[profile_id]': selected_val.val(),
                'query[profile_name]': selected_val.text(),
            });
        } else {
            this.url_params = _.omit(this.url_params, [ 'query[profile_id]', 'query[profile_name]' ]);
        }

        var path = '/' + I18n.currentLocale() + '/tracks';
        if (!Skyderby.helpers.isEmptyObject(this.url_params)) {
            path += '?' + $.param(this.url_params);
        }

        Turbolinks.visit(path);
    },

    on_change_suit: function(e) {
        var select_field = $(e.currentTarget);
        var selected_val = select_field.find('option:selected');

        if (selected_val.val()) {
            $.extend(this.url_params, {
                'query[suit_id]': selected_val.val(),
                'query[suit_name]': selected_val.text(),
            });
        } else {
            this.url_params = _.omit(this.url_params, [ 'query[suit_id]', 'query[suit_name]' ]);
        }

        var path = '/' + I18n.currentLocale() + '/tracks';
        if (!Skyderby.helpers.isEmptyObject(this.url_params)) {
            path += '?' + $.param(this.url_params);
        }

        Turbolinks.visit(path);
    },

    on_change_place: function(e) {
        var select_field = $(e.currentTarget);
        var selected_val = select_field.find('option:selected');

        if (selected_val.val()) {
            $.extend(this.url_params, {
                'query[place_id]': selected_val.val(),
                'query[place_name]': selected_val.text(),
            });
        } else {
            this.url_params = _.omit(this.url_params, [ 'query[place_id]', 'query[place_name]' ]);
        }

        var path = '/' + I18n.currentLocale() + '/tracks';
        if (!Skyderby.helpers.isEmptyObject(this.url_params)) {
            path += '?' + $.param(this.url_params);
        }

        Turbolinks.visit(path);
    },

    init_pilot_select: function() {
        var select_field = this.$('select[name="query[profile_id]"]');

        if (this.url_params['query[profile_id]'] && this.url_params['query[profile_name]']) {
            var option = $('<option />', { value: this.url_params['query[profile_id]'], text: this.url_params['query[profile_name]'] });
            select_field.append(option);
        }

        select_field.append($('<option />', { value: '' }));

        Skyderby.helpers.PilotSelect(select_field, { placeholder: I18n.t('tracks.index.filter_by_pilot') });
    },
    
    init_suit_select: function() {
        var select_field = this.$('select[name="query[suit_id]"]');
        
        if (this.url_params['query[suit_id]'] && this.url_params['query[suit_name]']) {
            var option = $('<option />', { value: this.url_params['query[suit_id]'], text: this.url_params['query[suit_name]'] });
            select_field.append(option);
        }

        select_field.append($('<option />', { value: '' }));

        Skyderby.helpers.SuitSelect(select_field, { placeholder: I18n.t('tracks.index.filter_by_suit') });
    },

    init_place_select: function() {
        var select_field = this.$('select[name="query[place_id]"]');
        
        if (this.url_params['query[place_id]'] && this.url_params['query[place_name]']) {
            var option = $('<option />', { value: this.url_params['query[place_id]'], text: this.url_params['query[place_name]'] });
            select_field.append(option);
        }

        select_field.append($('<option />', { value: '' }));

        Skyderby.helpers.PlaceSelect(select_field, { placeholder: I18n.t('tracks.index.filter_by_place') });
    },
});
