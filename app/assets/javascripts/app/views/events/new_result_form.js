Skyderby.views.NewResultForm = Backbone.View.extend({

    template: JST['app/templates/new_result_form'],

    tagName: 'div',

    className: 'modal-dialog',

    events: {
        'change .btn-file :file'     : 'change_file_field',
        'fileselect .btn-file :file' : 'file_select',
        'submit #new-result-form'    : 'onSubmit',
        'click .toggle-track'        : 'onToggleTrack'
    },

    initialize: function() {
        this.modalView = new Skyderby.views.ModalView();
        this.on('changemode', this.onChangeMode);
    },

    mode: 'file',

    render: function() {
        var modalTitle = I18n.t('events.show.result') + ': ' +
            (this.model.isNew() ?
                I18n.t('events.show.new') :
                I18n.t('events.show.edit'));

        this.modalView.$el.html(
            this.$el.html(this.template({title: modalTitle}))
        );

        this.listenTo(this.modalView, 'modal:shown', this.onModalShown);
        this.listenTo(this.modalView, 'modal:hidden', this.onModalHidden);

        this.init_track_select();

        this.trigger('changemode');

        this.init_form_validation();

        return this;
    },

    open: function() {
        this.modalView.show();
        return this;
    },

    onModalShown: function() {},

    onModalHidden: function() {
        this.remove();
    },

    init_form_validation: function() {
        this.$('#new-result-form').validate({
            ignore: 'input[type=hidden]',
            groups: {
                track: 'event_track[track_id] event_track[track_file]'
            },
            rules: {
                'event_track[track_id]': {
                    require_from_group: [1, '.result-track-group']
                }
            },
            messages: {
                'event_track[track_id]': {
                    require_from_group: I18n.t('jquery_validate.required_field')
                },
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorPlacement: function(error, element) {
                if (element.hasClass('result-track-group')) {
                    error.appendTo( element.closest('div') );    
                } else {
                    error.insertAfter(element);
                }
            }
        });        

    },

    onSubmit: function(e) {
        e.preventDefault();

        var competitor = window.Competition.competitors.get(this.model.get('competitor_id'));

        var params = {
            track_id: this.$('select[name="event_track[track_id]"]').val(),
            track_file: this.$('input[name="event_track[track_file]"]')[0].files[0],
            user_profile_id: competitor.get('user_profile_id'),
            wingsuit_id: competitor.get('wingsuit_id')
        };

        if (this.model.isNew()) {
            this.model.set(params);
            window.Competition.tracks.create(this.model, {wait: true, error: fail_ajax_request});
        } else {
            this.model.save(params, {patch: true, wait: true, error: fail_ajax_request});
        }

        this.modalView.hide();
    },

    onChangeMode: function() {
        
        var toggle_link    = this.$('.toggle-track');
        var toggle_caption = this.$('.toggle-track-caption');

        var file_group     = this.$('.track-file-group');
        var file_name      = this.$('.track-file-group input[type="text"]');
        var file_input     = this.$('.track-file-group input[name="event_track[track_file]"]');
        var select_field   = this.$('.result-track');

        if (this.mode === 'list') {
            toggle_link.text(I18n.t('events.show.toggle_new_track'));
            toggle_caption.text(I18n.t('events.show.result_or'));
            file_group.hide();
            file_name.val('');
            file_input.val('');
            $('.result-track + span').show();
        } else {
            toggle_link.text(I18n.t('events.show.toggle_existed_track'));
            toggle_caption.text(I18n.t('events.show.result_or'));
            file_group.show();
            select_field.select2('val', '');
            $('.result-track + span').hide();
        }

    },

    onToggleTrack: function(e) {

        e.preventDefault();

        if (this.mode === 'file') {
            this.mode = 'list';
        } else {
            this.mode = 'file';
        }

        this.trigger('changemode');

    },

    init_track_select: function() {
        var select_field = this.$('select[name="event_track[track_id]"]');
        var competitor_id = this.model.get('competitor_id');
        var profile_id = window.Competition.competitors.get(competitor_id).get('user_profile_id');

        select_field.select2({
            theme: 'bootstrap',
            width: '100%',
            placeholder: "Choose track from list",
            ajax: {
                url: '/tracks',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    term.profile_id = profile_id;
                    return {
                        query: term
                    };
                },
                processResults: function (data) {
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item.presentation,
                                id: item.id
                            };
                        })
                    };
                },
                cache: true
            }
        });
    },

    change_file_field: function(event) {
        Skyderby.helpers.FileField.change(event);
    },
    
    file_select: function(event, numFiles, label) {
        Skyderby.helpers.FileField.fileselect(event, numFiles, label);
    }

});
