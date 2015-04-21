var Event = Event || {};

Event.Section = function(params) {
    this.id = '';
    this.event_id = '';
    this.name = '';
    this.order = '';

    this.$form = $('#section-form-modal');

    $.extend(this, params);
    this.is_new = !this.id;
}

Event.Section.prototype = {

    open_form: function() {
        var modal_title;

        if (this.is_new) {
            modal_title = 'New';
        } else {
            modal_title = 'Edit';
        }

        $('#section-form-modal-title').text('Class: ' + modal_title);
        $('#section-name').val(this.name);

        $('#submit-section-form')
            .off('click')
            .on('click', this.on_form_submit.bind(this));

        $('#section-form-modal')
            .off('shown.bs.modal')
            .on('shown.bs.modal', this.on_modal_shown);

        $('#section-name')
            .off('keydown')
            .on('keydown', this.section_name_keydown);

        this.$form.modal('show');
    },

    on_modal_shown: function() {
        $('#section-name').focus();
    },

    section_name_keydown: function (e) {
        if (e.which == 9 || e.which == 13) {
            e.preventDefault();
            $('#submit-section-form').focus();
        }
    },

    on_form_submit: function(e) {
        e.preventDefault();

        this.$form.modal('hide');
        this.name = $('#section-name').val();
        this.save();
    },

    save: function() {
        var url, method, data;

        if (this.is_new) {
            url = '/api/sections/';
            method = 'POST';
        } else {
            url = '/api/sections/' + this.id;
            method = 'PATCH';
        }

        data = {
            section: {
                name: this.name,
                event_id: window.Competition.id
            }
        };

        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            data: data
        })
            .done(this.after_save.bind(this))
            .fail(fail_ajax_request);
    },

    reorder_with: function(with_section, direction) {
        var tmp = this.order;
        this.order = with_section.order;
        with_section.order = tmp;

        var self = this;

        $.ajax({
            url: '/api/sections/reorder',
            method: 'POST',
            dataType: 'json',
            context: {direction: direction},
            data: {
                sections: [{
                    section_id: this.id,
                    order: this.order
                },
                {
                    section_id: with_section.id,
                    order: with_section.order
                }]
            }
        })
            .done(function(data) {
                self.after_reorder(direction);
            }).fail(fail_ajax_request);
    },

    destroy: function() {
        $.ajax({
            url: '/api/sections/' + this.id,
            method: 'DELETE',
            dataType: 'json',
            context: {id: this.id}
        })
            .done(this.after_destroy.bind(this))
            .fail(fail_ajax_request);
    },

    after_save: function(data, status, jqXHR) {
        var is_new = this.is_new;

        $.extend(this, data);
        this.is_new = !this.id;

        if (is_new) {
            window.Competition.on_section_create(this);
        } else {
            window.Competition.on_section_update(this);
        }
    },

    after_destroy: function() {
        window.Competition.on_section_delete(this);
    },

    after_reorder: function(direction) {
        window.Competition.scoreboard.move_sections(this, direction);    
    },

    render: function(can_manage) {
        return this.template({
            id: this.id,
            name: this.name,
            can_manage: can_manage
        });
    }
}
