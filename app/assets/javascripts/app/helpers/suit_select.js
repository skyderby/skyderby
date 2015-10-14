Skyderby.helpers.SuitSelect = function(elem, opts) {

    if (!opts) opts = {};

    var options = {
        theme: 'bootstrap',
        width: '100%',
        placeholder: I18n.t('tracks.form.suit_select_placeholder'),
        allowClear: true,
        ajax: {
            url: '/wingsuits',
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
                            manufacturer: obj.manufacturer.name
                        };
                    })
                    .groupBy(function(obj) { 
                        return obj.manufacturer;
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
    };

    $.extend(options, opts);

    elem.select2(options);
};
