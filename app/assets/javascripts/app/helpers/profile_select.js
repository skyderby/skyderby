Skyderby.helpers.ProfileSelect = function(elem, opts) {

    if (!opts) opts = {};

    var options = {
        theme: 'bootstrap',
        containerCssClass: ':all:',
        width: '100%',
        placeholder: I18n.t('tracks.form.profile_select_placeholder'),
        allowClear: true,
        ajax: {
            url: '/profiles/select_options',
            dataType: 'json',
            type: "GET",
            quietMillis: 50,
            data: function (term) {
                if (opts.only_registered) term.only_registered = true;
                return { query: term };
            },
            cache: true
        }
    };

    $.extend(options, opts);

    Skyderby.helpers.select2_fix_open_on_clear(elem);
    elem.select2(options);
};
