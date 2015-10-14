Skyderby.helpers.PilotSelect = function(elem, opts) {

    if (!opts) opts = {};

    var options = {
        theme: 'bootstrap',
        width: '100%',
        placeholder: I18n.t('tracks.form.profile_select_placeholder'),
        allowClear: true,
        ajax: {
            url: '/user_profiles',
            dataType: 'json',
            type: "GET",
            quietMillis: 50,
            data: function (term) {
                return {
                    query: term
                };
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.name,
                            id: item.id
                        };
                    })
                };
            },
            cache: true
        }
    };

    $.extend(options, opts);

    elem.select2(options);
};
