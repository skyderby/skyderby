Skyderby.helpers.TrackSelect = function(elem, opts) {
    var profile_id;
    if (_.has(opts, 'profile_id')) profile_id = opts.profile_id;

    elem.select2({
        theme: 'bootstrap',
        width: '100%',
        placeholder: "Choose track from list",
        ajax: {
            url: '/tracks',
            dataType: 'json',
            type: "GET",
            quietMillis: 50,
            data: function (term) {
                if (profile_id) term.profile_id = profile_id;
                return {
                    query: term
                };
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.presentation,
                            id: item.id
                        };
                    })
                };
            },
            cache: true
        }
    });
}
