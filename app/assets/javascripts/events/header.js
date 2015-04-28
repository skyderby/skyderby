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
            I18n.t('general.edit'),
        '</a>'
    ].join('\n'));

    this.edit_commands = _.template([
         '<div class="col-md-7">',
            '<button class="btn btn-default button-add-class">',
                '<i class="fa fa-plus"></i>',
                'Class',
            '</button>',
            '<button class="btn btn-default button-add-competitor">',
                '<i class="fa fa-plus"></i>',
                'Competitor',
            '</button>',
            '<div class="btn-group">',
                '<button class="btn btn-default" data-toggle="dropdown">',
                    '<i class="fa fa-plus"></i>',
                    'Round',
                    '<i class="fa fa-caret-down"></i>',
                '</button>',
                '<ul class="dropdown-menu dropdown-menu-right" role="menu">',
                    '<li><a class="add-distance-round" href="#"><%= I18n.t("disciplines.distance") %></a></li>',
                    '<li><a class="add-time-round" href="#"><%= I18n.t("disciplines.time") %></a></li>',
                    '<li><a class="add-speed-round" href="#"><%= I18n.t("disciplines.speed") %></a></li>',
                '</ul>',
            '</div>',
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
        this.$range.text(
            I18n.t('events.show.comp_window') 
            + ' ' + Competition.range_from 
            + ' - ' + Competition.range_to 
            + ' ' + I18n.t('units.m')
        );
    },

    bind_events: function() {
        $('.button-add-class')
            .on('click', this.on_button_add_class_click.bind(this));
        $('.button-add-competitor')
            .on('click', this.on_button_add_competitor_click.bind(this));
        $('.add-distance-round')
            .on('click', this.on_button_add_distance_round_click.bind(this));
        $('.add-speed-round')
            .on('click', this.on_button_add_speed_round_click.bind(this));
        $('.add-time-round')
            .on('click', this.on_button_add_time_round_click.bind(this));
        $('.edit-event')
            .on('click', this.on_link_edit_event_click.bind(this));
    },

    on_button_add_class_click: function(e) {
        e.preventDefault();
        var new_section = new Event.Section;
        new_section.open_form();
    },

    on_button_add_competitor_click: function(e) {
        e.preventDefault();
        var new_competitor = new Event.Competitor;
        new_competitor.open_form();
    },

    on_button_add_distance_round_click: function(e) {
        e.preventDefault();
        new Event.Round({discipline: 'distance'}).save();
    },
    
    on_button_add_speed_round_click: function(e) {
        e.preventDefault()
        new Event.Round({discipline: 'speed'}).save();
    },

    on_button_add_time_round_click: function(e) {
        e.preventDefault()
        new Event.Round({discipline: 'time'}).save();
    },

    on_link_edit_event_click: function(e) {
        e.preventDefault()
        window.Competition.open_form(e);
    },
}
