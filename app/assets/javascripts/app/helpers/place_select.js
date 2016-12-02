Skyderby.helpers.PlaceSelect = function(elem, opts) {

    var options = {
        theme: 'bootstrap',
        width: '100%',
        placeholder: I18n.t('events.show.place_placeholder'),
        allowClear: true,
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
                var places_data = _.chain(data)
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
                    results: places_data
                };
            },
            cache: true
        }
    };

    $.extend(options, opts);

    Skyderby.helpers.select2_fix_open_on_clear(elem);
    elem.select2(options);
};
