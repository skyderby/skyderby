Skyderby.helpers.placeValidation = function($el) {
    $el.validate({
        rules: {
            'place[name]': {
                required: true
            },
            'place[latitude]': {
                required: true
            },
            'place[longitude]': {
                required: true
            },
            'place[country_id]': {
                required: true
            }
        },
        messages: {
            'place[name]': {
                required: I18n.t('jquery_validate.required_field')
            },
            'place[latitude]': {
                required: I18n.t('jquery_validate.required_field')
            },
            'place[longitude]': {
                required: I18n.t('jquery_validate.required_field')
            },
            'place[country_id]': {
                required: I18n.t('jquery_validate.required_field')
            },
        },
        highlight: function(element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function(element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorPlacement: function(error, element) {
            if (element.is('select[name="place[country_id]"]')) {
                error.appendTo( element.closest('div') );    
            } else {
                error.insertAfter(element);
            }
        }
    });        
};
