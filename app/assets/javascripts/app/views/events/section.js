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

        this.listenTo(this.model, 'change', this.update_section);
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
        
        var section_tbody = $(e.currentTarget).closest('tbody');
        var section_id = section_tbody.attr('id').replace('section_', "");
    
        var section = window.Competition.sections.get(section_id);
        var section_form = new Skyderby.views.SectionForm({model: section});
        section_form.render().open();
    },

    delete_section_click: function(e) {
        e.preventDefault();

        var section_tbody = $(e.currentTarget).closest('tbody');
        var rows_count = section_tbody.children().length;

        if (rows_count > 1) {
            alert('Перед удалением класса необходимо переместить всех участников из него в другие классы');
        } else {
            var section_id = section_tbody.attr('id').replace('section_', "");
            window.Competition.sections.get(section_id).destroy();
        }
    },

    move_section_click: function(e) {
        e.preventDefault();

        if ($(e.currentTarget).is('.section-up')) {
            this.model.collection.move_up(this.model);
        } else {
            this.model.collection.move_down(this.model);
        }

        // var $section = $(this).parents('tbody:first');
        // var section = window.Competition.sections.get($section.data('id'));
        //
        // if ($(this).is('.section-up')) {
        //     var $prev_element = $section.prev();
        //
        //     if (!$prev_element.is('thead')) {
        //         var prev_section = window.Competition.sections.get($prev_element.data('id'));
        //         section.reorder_with(prev_section, 'up');                
        //     }
        // } else {
        //     var $next_element = $section.next();
        //
        //     if (!$next_element.is('#table-footer')) {
        //         var next_section = window.Competition.sections.get($next_element.data('id'));
        //         section.reorder_with(next_section, 'down');
        //     }
        // }
    },

    update_section: function() {
        this.$el.attr('data-order', this.model.get('order'));

        this.$el.find('#section_' + this.model.get('id') + '_name_cell [data-role="name"]')
            .text(this.model.get('name') + ':');
    },

    destroy_section: function() {
        this.$el.remove();
    }
});
