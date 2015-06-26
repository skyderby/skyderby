$(document).on('ready page:load', function() {
    if ($('#new-event-modal').length) {
        $('select[name=place_id]').select2({
            width: '100%',
            placeholder: I18n.t('events.show.place_placeholder'),
            dropdownParent: '#new-event-modal',
            ajax: {
                url: '/places',
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
                                country: obj.country.name
                            };
                        })
                        .groupBy(function(obj) { 
                            return obj.country;
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
