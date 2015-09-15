var NewTrackForm = function() {
    this.name = '';
    this.suit = {};
    this.location = '';
    this.track_file = '';

    this.$form_modal = $('#newTrackModal');
    this.$form = $('#track_upload_form');
    this.$form_name = $('#track_upload_form input[name="track[name]"]');
    this.$form_suit_select = $('.new-track-wingsuit-select');
    this.$form_suit_input = $('#track_upload_form input[name="track[suit]"]');
    this.$form_location = $('#track_upload_form input[name="track[location]"]');
    this.$form_toggle_suit = $('#track_upload_form .toggle-suit');
    this.$form_toggle_suit_caption = $('#track_upload_form .toggle-suit-caption');

    this.bind_events();
    this.read_cookie();
    this.init();
};

NewTrackForm.prototype = {
    bind_events: function() {
        this.$form_modal
            .off('shown.bs.modal')
            .on('shown.bs.modal', this.on_modal_shown.bind(this));    

        this.$form_modal
            .off('hide.bs.modal')
            .on('hide.bs.modal', this.on_modal_hide.bind(this));

        this.$form
            .off('submit')
            .on('submit', this.on_submit.bind(this));

        this.$form_toggle_suit
            .off('click')
            .on('click', this.on_toggle_suit.bind(this));
    },
    
    init: function() {
        this.$form_name.val(this.name);

        this.$form_suit_select.find('option').remove();

        if (this.suit.id && this.suit.name) {
            var option = $('<option />', {value: this.suit.id, text: this.suit.name});
            this.$form_suit_select.append(option);
            this.$form_suit_select.append($('<option />'));
        }

        this.$form_location.val(this.location);

        new Skyderby.helpers.TrackSuitSelect(this.$form_suit_select);
        this.init_form_validation();

        this.$form_toggle_suit.data('state', 'select');
        this.on_toggle_suit();
    },

    init_form_validation: function() {
        this.$form.validate({
            ignore: 'input[type=hidden]',
            groups: {
                suit: 'track[wingsuit_id] track[suit]'
            },
            rules: {
                'track[name]': {
                    minlength: 3,
                    required: function() {
                        return $('#newTrackModal input#name');
                    }
                },
                'track[wingsuit_id]': {
                    require_from_group: [1, '.suit-group']
                },
                'track[suit]': {
                    require_from_group: [1, '.suit-group']
                },
                'track[location]': {
                    minlength: 3,
                    required: true
                },
                'track[file]': {
                    required: true,
                    extension: 'csv|gpx|tes',
                    filesize: 3145728 // 3 Mb
                }
            },
            messages: {
                'track[file]': {
                    extension: 'Please enter file with valid extension (csv, gpx, tes)',
                    filesize: 'File should be less than 1MB'
                },
                'track[suit]': {
                    require_from_group: 'This field is required.'
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorPlacement: function(error, element) {
                if (element.attr("name") == "track[file]") {
                    error.appendTo( element.closest(".col-sm-9") );
                } else if(element.hasClass('suit-group')) {
                    error.appendTo( element.closest('div') );    
                } else {
                    error.insertAfter(element);
                }
            }
        });
    },

    on_modal_shown: function() {},

    on_modal_hide: function() {
        this.write_cookie();
    },

    on_submit: function() {
        this.write_cookie();
    },

    on_toggle_suit: function(e) {
        if (e) {
            e.preventDefault();
        }

        if (this.$form_toggle_suit.data('state') == 'select') {
            this.$form_toggle_suit.data('state', 'enter').text(I18n.t('tracks.form.toggle_suit_link'));
            this.$form_toggle_suit_caption.text(I18n.t('tracks.form.toggle_suit_caption'));
            this.$form_suit_input.val('').hide();
            $('.new-track-wingsuit-select + span').show();
        } else {
            this.$form_toggle_suit.data('state', 'select').text(I18n.t('tracks.form.toggle_suit_link_select'));
            this.$form_toggle_suit_caption.text(I18n.t('tracks.form.toggle_suit_caption_select'));
            this.$form_suit_input.show();
            this.$form_suit_select.select2('val', '');
            $('.new-track-wingsuit-select + span').hide();
        }
    },

    read_cookie: function() {
        this.name = $.cookie('name') || '';
        this.suit = {
            id: $.cookie('suit_id') || '',
            name: $.cookie('suit_name') || ''
        };
        this.location = $.cookie('location');
    },

    write_cookie: function() {
        $.cookie('name', this.$form_name.val(), { expires: 365, path: '/' });

        var selected_suit = $('.new-track-wingsuit-select option:selected');
        $.cookie('suit_name', selected_suit.text(), { expires: 365, path: '/' });
        $.cookie('suit_id', selected_suit.val(), { expires: 365, path: '/' });

        $.cookie('location', this.$form_location.val(), { expires: 365, path: '/' });
    }
};

$(document).on('ready page:load', function() {
    if ($('#newTrackModal').length) {
        window.new_track_form = new NewTrackForm();
    }
}); 
