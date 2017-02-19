Skyderby.helpers.PlaceSelect = function(elem, opts) {
    var options = {
        theme: 'bootstrap',
        containerCssClass: ':all:',
        width: '100%',
        placeholder: I18n.t('events.show.place_placeholder'),
        allowClear: true,
        ajax: {
            url: '/places/select_options',
            dataType: 'json',
            type: "GET",
            quietMillis: 50,
            data: function (term) { return { query: term }; },
            cache: true
        }
    };

    $.extend(options, opts);

    Skyderby.helpers.select2_fix_open_on_clear(elem);
    elem.select2(options);
};
