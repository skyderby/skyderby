var Event = Event || {};

Event.Header = function(params) {
    this.name = '';
    this.range_from = '';
    this.range_to = '';
    this.status = '';

    this.$title = $('#title-competition-name');
    this.$range = $('#title-competition-range');
    this.$table_edit_controls = $('#edit-table-commands');
    this.$event_edit_commands = $('#edit-event-commands')

    ///////////////////////////////////////////
    // Templates
    this.fa_fw = _.template([
        '<small>',
            '<i class="fa fa-fw"></i>',
        '</small>'
    ].join('\n'));

    this.edit_event = _.template([
        '<a href="#" class="btn btn-default edit-event">',
            '<i class="fa fa-fw fa-pencil text-muted"></i>',
        '</a>'
    ].join('\n'));

    this.edit_commands = _.template([
         '<div class="col-md-7">',
            '<button id="button-add-class" class="btn btn-default">',
                '<i class="fa fa-plus"></i>',
                'Класс',
            '</button>',
            '<button id="button-add-competitor" class="btn btn-default">',
                '<i class="fa fa-plus"></i>',
                'Участник',
            '</button>',
            '<button id="button-add-round" class="btn btn-default">',
                '<i class="fa fa-plus"></i>',
                'Раунд',
            '</button>',
         '</div>'
    ].join('\n'));

    ///////////////////////////////////////////////////////////////////////////
    // Initialization
    //
    $.extend(this, params);
    this.init();
}

Event.Header.prototype = {
    init: function() {
        var can_manage = window.Competition.can_manage;
        if (can_manage) {
            this.render_edit_controls();
            this.bind_events();
        }
    },

    render_edit_controls: function () {
        this.$event_edit_commands.append(this.edit_event());

        this.$table_edit_controls.append(this.edit_commands());
        this.$table_edit_controls.addClass('top-buffer');
    },

    render: function() {
        this.$title.text(this.name);
        this.$range.text('Соревновательный диапазон: ' + Competition.range_from + ' - ' + Competition.range_to + ' м');
    },

    bind_events: function() {
        $('#button-add-class')
            .on('click', this.on_button_add_class_click.bind(this));
        $('#button-add-competitor')
            .on('click', this.on_button_add_competitor_click.bind(this));
        $('#button-add-round')
            .on('click', this.on_button_add_round_click.bind(this));
        $('.edit-event')
            .on('click', this.on_link_edit_event_click.bind(this));
    },

    on_button_add_class_click: function() {
        var new_section = new Event.Section;
        new_section.open_form();
    },

    on_button_add_competitor_click: function() {
        var new_competitor = new Event.Competitor;
        new_competitor.open_form();
    },

    on_button_add_round_click: function() {
        var new_round = new Event.Round();
        new_round.open_form();
    },

    on_link_edit_event_click: function(e) {
        window.Competition.open_form(e);
    },
}
