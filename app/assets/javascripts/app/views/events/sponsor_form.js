Skyderby.views.SponsorForm = Backbone.View.extend({

    template: JST['app/templates/sponsor_form'],

    tagName: 'div',

    className: 'modal-dialog',

    events: {
        'change .btn-file :file'     : 'change_file_field',
        'fileselect .btn-file :file' : 'file_select',
        'submit #sponsor-form'       : 'onSubmit'
    },

    initialize: function() {
        this.modalView = new Skyderby.views.ModalView();
    },

    render: function() {
        var modalTitle = I18n.t('activerecord.models.event_sponsor') + ': ' + 
            (this.model.isNew() ? 
                I18n.t('events.show.new') : 
                I18n.t('events.show.edit'));

        this.modalView.$el.html(
            this.$el.html(this.template({title: modalTitle}))
        );

        this.listenTo(this.modalView, 'modal:shown', this.onModalShown);
        this.listenTo(this.modalView, 'modal:hidden', this.onModalHidden);

        $('#sponsor-form input[name="event_sponsor[id]"]').val(this.model.get('id'));
        $('#sponsor-form input[name="event_sponsor[name]"]').val(this.model.get('name'));
        $('#sponsor-form input[name="event_sponsor[website]"]').val(this.model.get('website'));

        return this;
    },

    open: function() {
        this.modalView.show();
        return this;
    },

    onModalShown: function() {
        $('#sponsor-form input[name="event_sponsor[name]"]').focus();
    },

    onModalHidden: function() {
        this.$el.remove();
    },

    onSubmit: function(e) {
        e.preventDefault();
        var params = {
            name: $('#sponsor-form input[name="event_sponsor[name]"]').val(),
            website: $('#sponsor-form input[name="event_sponsor[website]"]').val(),
            logo: $('#sponsor-form input[name="event_sponsor[logo]"]')[0].files[0],
        };

        this.model.set(params);
        if (this.model.isNew()) {
            window.Competition.sponsors.create(this.model, {wait: true});
        } else {
            this.model.save();
        }

        this.modalView.hide();
    },

    change_file_field: function(event) {
        Skyderby.helpers.FileField.change(event);
    },
    
    file_select: function(event, numFiles, label) {
        Skyderby.helpers.FileField.fileselect(event, numFiles, label);
    }
});
