var Event = Event || {};

Event.Competitor = function(params) {
    this.id = '';
    this.event_id = '';
    this.profile = null
    this.section = null;
    this.wingsuit = null;

    this.$form = $('#competitor-form-modal');
    this.$form_title = $('#competitor-form-modal-title');
    this.$form_submit = $('#submit-competitor-form');
    this.$form_id = $('#competitor-id');
    this.$form_name = $('.competitor-profile');
    this.$form_new_name = $('.new-profile-name');
    this.$form_toggle_profile = $('.toggle-profile');
    this.$form_toggle_profile_caption = $('.toggle-profile-caption');
    this.$form_profile_id = $('#competitor-profile-id');
    this.$form_suit = $('#competitor-wingsuit');
    this.$form_suit_id = $('#competitor-wingsuit-id');
    this.$form_section = $('#competitor-section');

    $.extend(this, params);
    this.is_new = !this.id;
}

Event.Competitor.prototype = {
    open_form: function() {
        this.$form_title.text('Участник: Добавление');

        this.$form_section.find('option').remove();
        this.$form_name.find('option').remove();
        this.$form_suit.find('option').remove();

        var self = this;

        $.each(window.Competition.sections, function(index, value) {
            $('<option />', {value: value.id, text: value.name})
                .appendTo(self.$form_section);
        });

        this.$form_id = this.id;
        if (this.profile && this.profile.id) {
            $('<option />', {value: this.profile.id, text: this.profile.name})
                .appendTo(this.$form_name);
        };

        if (this.wingsuit && this.wingsuit.id) {
            $('<option />', {value: this.wingsuit.id, text: this.wingsuit.name})
                .appendTo(this.$form_suit);
        }       
        
        if (this.section && this.section.id) {
            this.$form_section.val(this.section.id);
        }

        this.$form_name.select2({
            width: '100%',
            placeholder: 'Select pilot from list',
            dropdownParent: this.$form,
            // minimumInputLength: 2,
            ajax: {
                url: '/api/user_profiles',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    return {
                        query: term
                    };
                },
                processResults: function (data) {
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item.name,
                                id: item.id
                            }
                        })
                    };
                },
                cache: true
            }
        });

        this.$form_suit.select2({
            width: '100%',
            // placeholder: "Search for an Item",
            dropdownParent: this.$form,
            // minimumInputLength: 2,
            ajax: {
                url: '/api/wingsuits',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    return {
                        query: term
                    };
                },
                processResults: function (data) {
                    var suits_data = _.chain(data)
                        .map(function(obj) {
                            return {
                                id: obj.id,
                                text: obj.name,
                                manufacturer: obj.manufacturer.name
                            }
                        })
                        .groupBy(function(obj) { 
                            return obj.manufacturer;
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
                    return {
                        results: suits_data
                    };
                },
                cache: true
            }
        });

        this.$form_section.select2({
            width: '100%',
            minimumResultsForSearch: 10
        });

        this.$form_toggle_profile
            .off('click')
            .on('click', this.on_toggle_profile.bind(this));

        this.$form_toggle_profile.data('state', 'create');
        this.on_toggle_profile();

        // this.$form_new_name.hide();

        this.$form_submit
            .off('click')
            .on('click', this.on_form_submit.bind(this));

        this.$form
            .off('shown.bs.modal')
            .on('shown.bs.modal', this.on_modal_shown.bind(this));

        this.$form.modal('show');
    },

    on_modal_shown: function() {
        if (this.is_new) {
            this.$form_name.focus();
        }
    },

    on_toggle_profile: function(e) {
        if (e) {
            e.preventDefault();
        }

        if (this.$form_toggle_profile.data('state') == 'create') {
            this.$form_toggle_profile.data('state', 'choose').text('Create new profile');
            this.$form_toggle_profile_caption.text("Pilot you are looking for doesn't exist?");
            this.$form_new_name.val('').hide();
            $('.competitor-profile + span').show();
        } else {
            this.$form_toggle_profile.data('state', 'create').text('choose pilot from list');
            this.$form_toggle_profile_caption.text("Or");
            this.$form_new_name.show();
            this.$form_name.select2('val', '');
            $('.competitor-profile + span').hide()
        }
    },

    on_form_submit: function(e) {
        e.preventDefault();

        this.$form.modal('hide');
        this.validate_form();

        this.event_id = this.event_id || window.Competition.id;
        this.profile = {
            id: this.$form_name.val(),
            name: this.$form_new_name.val()
        };
        this.wingsuit = {
            id: this.$form_suit.val()
        };
        this.section = {
            id: this.$form_section.val()
        };

        this.save();
    },

    validate_form: function () {},

    on_select_profile: function(suggestion, elem) {
        var id_field = $(this).data('idfield');

        $(elem).val(suggestion.name);
        $(id_field).val(suggestion.profile_id);

    },

    save: function() {
        var url, method;

        if (this.is_new) {
            url = '/api/competitors';
            method = 'POST'; 
        } else {
            url = '/api/competitors/' + this.id;
            method = 'PATCH';
        }

        var params = {
            event_id: this.event_id,
            profile_id: this.profile.id,
            profile_name: this.profile.name,
            wingsuit_id: this.wingsuit.id,
            section_id: this.section.id
        };

        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            async: true,
            data: {
                competitor: params
            }
        })
            .done(this.after_save.bind(this))
            .fail(fail_ajax_request);
    },

    destroy: function() {
        $.ajax({
            url: '/api/competitors/' + this.id,
            method: 'DELETE',
            dataType: 'json',
            context: {id: this.id}
        })
            .done(this.after_destroy.bind(this))
            .fail(fail_ajax_request);
    },

    after_save: function(data) {
        var is_new = this.is_new;

        $.extend(this, data);
        this.is_new = !this.id;

        if (is_new) {
            window.Competition.on_competitor_create(this);
        } else {
            window.Competition.on_competitor_update(this);
        }
    },

    after_destroy: function() {
        window.Competition.on_competitor_delete(this);
    }
}
