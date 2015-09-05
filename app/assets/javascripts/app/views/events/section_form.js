Skyderby.views.SectionForm = Backbone.View.extend({

    template: JST['app/templates/section_form'],

    tagName: 'div',

    className: 'modal-dialog',

    events: {
        'submit #section-form': 'onSubmit'
    },

    initialize: function() {
        this.modalView = new Skyderby.views.ModalView();
    },

    render: function() {
        var modalTitle = I18n.t('events.show.section') + ': ' + 
            (this.model.isNew() ? 
                I18n.t('events.show.new') : 
                I18n.t('events.show.edit'));

        this.modalView.$el.html(
            this.$el.html(this.template({title: modalTitle}))
        );

        this.listenTo(this.modalView, 'modal:shown', this.onModalShown);
        this.listenTo(this.modalView, 'modal:hidden', this.onModalHidden);

        $('#section-form input[name="section[id]"]').val(this.model.get('id'));
        $('#section-form input[name="section[name]"]').val(this.model.get('name'));

        return this;
    },

    open: function() {
        this.modalView.show();
        return this;
    },

    onModalShown: function() {
        $('#section-form input[name="section[name]"]').focus();
    },

    onModalHidden: function() {
        this.$el.remove();
    },

    onSubmit: function(e) {
        e.preventDefault();
        var params = {
            name: $('#section-form input[name="section[name]"]').val()
        };

        this.model.set(params);
        if (this.model.isNew()) {
            window.Competition.sections.create(this.model, {wait: true, error: fail_ajax_request});
        } else {
            this.model.save({}, {wait: true, error: fail_ajax_request});
        }

        this.modalView.hide();
    }
});
