Skyderby.views.CompetitorForm = Backbone.View.extend({

    template: JST['app/templates/competitor_form'],

    tagName: 'div',

    className: 'modal-dialog',

    events: {
        'submit #competitor-form': 'onSubmit',
        'click .toggle-profile'  : 'onToggleProfile'
    },

    initialize: function() {
        this.modalView = new Skyderby.views.ModalView();
        this.on('changemode', this.onChangeMode);
    },

    mode: 'choose',

    render: function() {
        var modalTitle = I18n.t('events.show.competitor') + ': ' +
            (this.model.isNew() ?
                I18n.t('events.show.new') :
                I18n.t('events.show.edit'));

        this.modalView.$el.html(
            this.$el.html(this.template({title: modalTitle}))
        );

        this.listenTo(this.modalView, 'modal:shown', this.onModalShown);
        this.listenTo(this.modalView, 'modal:hidden', this.onModalHidden);

        $('#competitor-form input[name="section[id]"]').val(this.model.get('id'));

        this.init_profile_select();
        this.init_suit_select();
        this.init_section_select();

        this.init_form_validation();

        this.trigger('changemode');

        return this;
    },

    open: function() {
        this.modalView.show();
        return this;
    },

    onModalShown: function() {},

    onModalHidden: function() {
        this.$el.remove();
    },

    init_form_validation: function() {
        this.$('#competitor-form').validate({
            ignore: 'input[type=hidden]',
            groups: {
                pilot: 'competitor[user_profile_id] competitor[name]'
            },
            rules: {
                'competitor[name]': {
                    require_from_group: [1, '.pilot-group']
                },
                'competitor[wingsuit_id]': {
                    required: true
                },
                'competitor[section_id]': {
                    required: true
                }
            },
            messages: {
                'competitor[name]': {
                    require_from_group: I18n.t('jquery_validate.required_field')
                },
                'competitor[wingsuit_id]': {
                    required: I18n.t('jquery_validate.required_field')
                },
                'competitor[section_id]': {
                    required: I18n.t('jquery_validate.required_field')
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorPlacement: function(error, element) {
                if (element.hasClass('pilot-group') || element.is('select[name="competitor[wingsuit_id]"]')) {
                    error.appendTo( element.closest('div') );    
                } else {
                    error.insertAfter(element);
                }
            }
        });        
    },

    onSubmit: function(e) {
        e.preventDefault();

        var params = {
            profile_id: this.$('select[name="competitor[user_profile_id]"]').val(),
            profile_name: this.$('input[name="competitor[name]"]').val(),
            wingsuit_id: this.$('select[name="competitor[wingsuit_id]"]').val(),
            section_id: this.$('select[name="competitor[section_id]"]').val()
        };

        if (this.model.isNew()) {
            this.model.set(params);
            window.Competition.competitors.create(this.model, {wait: true});
        } else {
            this.model.save(params, {patch: true, wait: true});
        }

        this.modalView.hide();
    },

    onChangeMode: function() {
        
        var toggle_link    = this.$('.toggle-profile');
        var toggle_caption = this.$('.toggle-profile-caption');
        var name_field     = this.$('input[name="competitor[name]"]');
        var select_field   = this.$('.competitor-profile');

        if (this.mode === 'choose') {
            toggle_link.text(I18n.t('events.show.toggle_profile'));
            toggle_caption.text(I18n.t('events.show.profile_caption'));
            name_field.val('').hide();
            $('.competitor-profile + span').show();
        } else {
            toggle_link.text(I18n.t('events.show.profile_choose'));
            toggle_caption.text(I18n.t('events.show.profile_or'));
            name_field.show();
            select_field.select2('val', '');
            $('.competitor-profile + span').hide();
        }

    },

    onToggleProfile: function(e) {

        e.preventDefault();

        if (this.mode === 'create') {
            this.mode = 'choose';
        } else {
            this.mode = 'create';
        }

        this.trigger('changemode');

    },

    init_profile_select: function() {

        var select_field = this.$('select[name="competitor[user_profile_id]"]');

        if (!this.model.isNew()) {
            var option = $('<option />', {
                value: this.model.get('user_profile_id'), 
                text: this.model.get('profile').name
            });
            
            select_field.append(option);
        }
 
        select_field.select2({
            theme: 'bootstrap',
            width: '100%',
            placeholder: I18n.t('events.show.profile_placeholder'),
            ajax: {
                url: '/user_profiles',
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
                            };
                        })
                    };
                },
                cache: true
            }
        });

    },

    init_suit_select: function() {

        var select_field = this.$('select[name="competitor[wingsuit_id]"]');

        if (this.model.has('wingsuit')) {
            var option = $('<option />', {
                value: this.model.get('wingsuit_id'), 
                text: this.model.get('wingsuit').name
            });
            
            select_field.append(option);
        }

        select_field.select2({
            theme: 'bootstrap',
            width: '100%',
            placeholder: I18n.t('events.show.suit_placeholder'),
            ajax: {
                url: '/wingsuits',
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
                            };
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

    },

    init_section_select: function() {
        
        var select_field = this.$('select[name="competitor[section_id]"]');

        window.Competition.sections.each(function(value) {
            var option = $('<option />', {value: value.id, text: value.get('name')});
            select_field.append(option);
        });

        if (this.model.has('section_id')) select_field.val(this.model.get('section_id'));

        select_field.select2({
            theme: 'bootstrap',
            width: '100%',
            minimumResultsForSearch: 10
        });
    }
});
