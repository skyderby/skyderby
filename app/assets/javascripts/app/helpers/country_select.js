Skyderby.helpers.CountrySelect = function(elem, opts) {

    if (!opts) opts = {};

    var options = {
        theme: 'bootstrap',
        width: '100%',
        containerCssClass: ':all:',
        placeholder: 'Choose country',
        allowClear: true,
        ajax: {
            url: '/countries/select_options',
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
