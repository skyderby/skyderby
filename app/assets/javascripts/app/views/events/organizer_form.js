Skyderby.views.EventOrganizerForm = Backbone.View.extend({

    template: JST['app/templates/organizer_form'],

    tagName: 'div',

    className: 'modal-dialog',

    events: {
        'submit #organizer-form': 'onSubmit'
    },

    initialize: function() {
        this.modalView = new Skyderby.views.ModalView();
    },

    render: function() {
        var modalTitle = I18n.t('events.show.organizers') + ': ' +
            (this.model.isNew() ?
                I18n.t('events.show.new') :
                I18n.t('events.show.edit'));

        this.modalView.$el.html(
            this.$el.html(this.template({title: modalTitle}))
        );

        this.listenTo(this.modalView, 'modal:shown', this.onModalShown);
        this.listenTo(this.modalView, 'modal:hidden', this.onModalHidden);

        this.init_profile_select();

        $('#organizer-form input[name="section[id]"]').val(this.model.get('id'));

        this.init_form_validation();

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

    init_profile_select: function() {
        this.$('select[name="event_organizer[user_profile_id]"]').select2({
            theme: 'bootstrap',
            width: '100%',
            placeholder: I18n.t('events.show.organizers_placeholder'),
            ajax: {
                url: '/user_profiles',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    term.only_registered = true;
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

    init_form_validation: function() {
        this.$('#organizer-form').validate({
            rules: {
                'event_organizer[user_profile_id]': {
                    required: true
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            messages: {
                'event_organizer[user_profile_id]': {
                    required: I18n.t('jquery_validate.required_field')
                },
            },
            errorPlacement: function(error, element) {
                if (element.is('select[name="event_organizer[user_profile_id]"]')) {
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
            user_profile_id: this.$('#organizer-form select[name="event_organizer[user_profile_id]"]').val()
        };

        this.model.set(params);
        if (this.model.isNew()) {
            window.Competition.organizers.create(this.model, {wait: true, error: fail_ajax_request});
        } else {
            this.model.save({}, {wait: true, error: fail_ajax_request});
        }

        this.modalView.hide();
    }
});
