$(document).on('ready page:load', function() {
    if ($('#new-event-modal').length) {
        $("#new_event_form").validate({
            ignore: 'input[type=hidden]',
            rules: {
                'event[name]': {
                    minlength: 3,
                    required: true
                },
                'event[range_from]': {
                    required: true
                },
                'event[range_to]': {
                    required: true
                },
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
        });
    }
});
