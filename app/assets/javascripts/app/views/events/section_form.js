Skyderby.views.SectionForm = Backbone.View.extend({

    template: JST['app/templates/section_form'],

    tagName: 'div',

    className: 'modal-dialog',

    $modal_wrapper: $('#modal'), 

    events: {
        'hidden.bs.modal'     : 'onModalHidden',
        'shown.bs.modal'      : 'onModalShown',
        'submit #section-form': 'onSubmit'
    },

    render: function() {
        var modalTitle = I18n.t('events.show.section') + ': ' + 
            (this.model.isNew() ? 
                I18n.t('events.show.new') : 
                I18n.t('events.show.edit'));

        this.$modal_wrapper.html(
            this.$el.html(this.template({title: modalTitle}))
        );

        $('#section-form input[name="section[id]"]').val(this.model.get('id'));
        $('#section-form input[name="section[name]"]').val(this.model.get('name'));

        return this;
    },

    open: function() {
        this.$modal_wrapper.modal();
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
