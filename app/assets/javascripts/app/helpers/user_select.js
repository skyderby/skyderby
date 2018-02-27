Skyderby.helpers.UserSelect = function(elem, opts) {

    if (!opts) opts = {};

    var options = {
        theme: 'bootstrap',
        containerCssClass: ':all:',
        width: '100%',
        allowClear: true,
        ajax: {
            url: '/users/select_options',
            dataType: 'json',
            type: "GET",
            quietMillis: 50,
            data: function (params) {
                return {
                  query: params.term,
                  page: params.page
                };
            },
            cache: true
        }
    };

    $.extend(options, opts);

    Skyderby.helpers.select2_fix_open_on_clear(elem);
    elem.select2(options);
};
