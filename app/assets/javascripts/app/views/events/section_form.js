Skyderby.views.SectionForm = Backbone.View.extend({

    template: JST['app/templates/section_form'],

    tagName: 'div',

    className: 'modal-dialog',

    events: {
        'submit #section-form': 'onSubmit'
    },

    initialize: function() {
        this.modalView = new Skyderby.views.ModalView();
        this.listenTo(this.modalView, 'shown.bs.modal', this.onModalShown);
    },

    render: function() {
        var modalTitle = I18n.t('events.show.section') + ': ' + 
            (this.model.isNew() ? 
                I18n.t('events.show.new') : 
                I18n.t('events.show.edit'));

        this.modalView.$el.html(
            this.$el.html(this.template({title: modalTitle}))
        );

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
        console.log('on modal shown');
    },

    onModalHidden: function() {
        console.log('on modal hidden');
    },

    onSubmit: function(e) {
        e.preventDefault();
        console.log('on submit');
    }
});
