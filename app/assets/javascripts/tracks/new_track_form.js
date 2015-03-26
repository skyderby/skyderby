var NewTrackForm = function() {
    this.name = '';
    this.suit = {};
    this.location = '';
    this.track_file = '';

    this.$form_modal = $('#newTrackModal');
    this.$form = $('#track_upload_form');
    this.$form_name = $('#track_upload_form input[name="name"]');
    this.$form_suit_select = $('.new-track-wingsuit-select');
    this.$form_suit_input = $('#track_upload_form input[name="suit"]');
    this.$form_location = $('#track_upload_form input[name="location"]');
    this.$form_toggle_suit = $('#track_upload_form .toggle-suit');
    this.$form_toggle_suit_caption = $('#track_upload_form .toggle-suit-caption');

    this.bind_events();
    this.read_cookie();
    this.init();
}

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
            $('<option />', {value: this.suit.id, text: this.suit.name})
                .appendTo(this.$form_suit_select);
        }

        this.$form_location.val(this.location);

        this.init_suit_select();
        this.init_form_validation();

        this.$form_toggle_suit.data('state', 'select');
        this.on_toggle_suit();
    },

    init_suit_select: function() {
         this.$form_suit_select.select2({
            width: '100%',
            placeholder: 'Select suit from list',
            dropdownParent: this.$modal,
            ajax: {
                url: '/api/wingsuits',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    return {
                        query: term
                    };
                },
                processResults: function (data) {
                    var suits_data = _.chain(data)
                        .map(function(obj) {
                            return {
                                id: obj.id,
                                text: obj.name,
                                manufacturer: obj.manufacturer.name
                            }
                        })
                        .groupBy(function(obj) { 
                            return obj.manufacturer;
                        })
                        .map(function(obj, key) {
                            return {
                                text: key, 
                                children: obj
                            };
                        })
                        .sortBy(function(obj) {
                            return obj.text;
                        })
                        .value();
                    return {
                        results: suits_data
                    };
                },
                cache: true
            }
        });
    },

    init_form_validation: function() {
        this.$form.validate({
            ignore: 'input[type=hidden]',
            groups: {
                suit: 'wingsuit_id suit'
            },
            rules: {
                name: {
                    minlength: 3,
                    required: true
                },
                wingsuit_id: {
                    require_from_group: [1, '.suit-group']
                },
                suit: {
                    require_from_group: [1, '.suit-group']
                },
                location: {
                    minlength: 3,
                    required: true
                },
                track_file: {
                    required: true,
                    extension: 'csv|gpx|tes',
                    filesize: 1048576
                }
            },
            messages: {
                track_file: {
                    extension: 'Please enter file with valid extension (csv, gpx, tes)',
                    filesize: 'File should be less than 1MB'
                },
                suit: {
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
                if (element.attr("name") == "track_file") {
                    error.appendTo( element.closest(".col-sm-9") );
                } else if(element.hasClass('suit-group')) {
                    error.appendTo( element.closest('div') );    
                } else {
                    error.insertAfter(element);
                }
            }
        });
    },

    on_modal_shown: function() {
    },

    on_modal_hide: function() {
        this.write_cookie();
    },

    on_submit: function(e) {
        this.write_cookie();
    },

    on_toggle_suit: function(e) {
        if (e) {
            e.preventDefault();
        }

        if (this.$form_toggle_suit.data('state') == 'select') {
            this.$form_toggle_suit.data('state', 'enter').text('Enter suit name');
            this.$form_toggle_suit_caption.text("Suit you are flying doesn't exist?");
            this.$form_suit_input.val('').hide();
            $('.new-track-wingsuit-select + span').show();
        } else {
            this.$form_toggle_suit.data('state', 'select').text('Select suit form list');
            this.$form_toggle_suit_caption.text("Or just ");
            this.$form_suit_input.show();
            this.$form_suit_select.select2('val', '');
            $('.new-track-wingsuit-select + span').hide()
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
}

// $(document).ready(function($) {
//
//     var name = $.cookie('name');
//     if (typeof name !== 'undefined' && name.trim()) {
//         $('#name').val(name);
//     }
//
//     var suit = $.cookie('suit');
//     var wingsuit_id = $.cookie('wingsuit_id');
//     if (typeof suit !== 'undefined' 
//         && suit.trim() 
//         && typeof wingsuit_id !== 'undefined' 
//         && wingsuit_id.trim()) {
//
//         $('<option />', {value: wingsuit_id, text: suit})
//             .appendTo($('.new-track-wingsuit-select'));
//     }
//
//     var location = $.cookie('location');
//     if (typeof location !== 'undefined' && location.trim()) {
//         $('#location').val(location);
//     }
//
//     $('#track_upload_form').submit( function( e ) {
//       var form_valid = true;
//       var placeholder = '#alert-placeholder';
//       $(placeholder).empty();
//
//       if ($('#name').val().length === 0 || !$('#name').val().trim()) {
//           bootstrap_alert.warning(#{t 'static_pages.index.track_form.warnings.name_html'}, placeholder);
//           form_valid = false;
//       } else {
//           $.cookie('name', $('#name').val(), { expires: 365, path: '/' });
//       }
//
//       if ($('#suit').val().length === 0 || !$('#suit').val().trim()) {
//           bootstrap_alert.warning(#{t 'static_pages.index.track_form.warnings.suit_html'}, placeholder);
//           form_valid = false;
//       } else {
//           $.cookie('suit', $('#suit').val(), { expires: 365, path: '/' });
//           $.cookie('wingsuit_id', $('#wingsuit-id').val(), { expires: 365, path: '/' });
//       }
//
//       if ($('#location').val().length === 0 || !$('#location').val().trim()) {
//           bootstrap_alert.warning(#{t 'static_pages.index.track_form.warnings.loc_html'}, placeholder);
//           form_valid = false;
//       } else {
//           $.cookie('location', $('#location').val(), { expires: 365, path: '/' });
//       }
//
//       if ($('#track_file').val().length === 0 || !$('#track_file').val().trim()) {
//           bootstrap_alert.warning(#{t 'static_pages.index.track_form.warnings.file_html'}, placeholder);
//           form_valid = false;
//       }
//       if (!form_valid)
//           e.preventDefault();
//     });
// })

$(document).on('ready page:load', function() {
    if ($('#newTrackModal').length) {
        window.new_track_form = new NewTrackForm;        
    }
}); 
