Skyderby.views.Section = Backbone.View.extend({

    template: JST['app/templates/section'],

    tagName: 'tbody',

    events: {
        'click .edit-section'     : 'edit_section_click',
        'click .delete-section'   : 'delete_section_click',
        'click .section-up'       : 'move_section_click',
        'click .section-down'     : 'move_section_click',
    },

    initialize: function(opts) {
        if (_.has(opts, 'can_manage')) this.can_manage = opts.can_manage;
        if (_.has(opts, 'row_length')) this.row_length = opts.row_length;

        this.listenTo(this.model, 'sync', this.update_section);
        this.listenTo(this.model, 'destroy', this.destroy_section);
    },

    render: function() {
        this.$el
            .attr('id', 'section_' + this.model.get('id'))
            .attr('data-id', this.model.get('id'))
            .attr('data-order', this.model.get('order'));

        var template_attrs = $.extend(this.model.toJSON(), {
            can_manage: this.can_manage, 
            row_length: this.row_length
        });
        
        this.$el.html(this.template(template_attrs));

        return this;
    },

    edit_section_click: function(e) {
        e.preventDefault();
        
        var section_form = new Skyderby.views.SectionForm({model: this.model});
        section_form.render().open();
    },

    delete_section_click: function(e) {
        e.preventDefault();

        var section_tbody = $(e.currentTarget).closest('tbody');
        var rows_count = section_tbody.children().length;

        if (rows_count > 1) {
            alert('Перед удалением класса необходимо переместить всех участников из него в другие классы');
        } else {
            this.model.destroy();
        }
    },

    move_section_click: function(e) {
        e.preventDefault();

        if ($(e.currentTarget).is('.section-up')) {
            this.model.collection.move_up(this.model);
        } else {
            this.model.collection.move_down(this.model);
        }

    },

    update_section: function() {
        this.$el.attr('data-order', this.model.get('order'));

        this.$el.find('#section_' + this.model.get('id') + '_name_cell [data-role="name"]')
            .text(this.model.get('name') + ':');
    },

    destroy_section: function() {
        this.remove();
    }
});
