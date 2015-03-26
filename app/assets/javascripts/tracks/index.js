var filters = {};

function on_filter_change() {

}

function init() {
    $(document).on('change', 'input:radio[name="filter[kind]"]', on_kind_change)
        .on('change', '#wingsuit-filter-id', on_suit_change)
        .on('change', '#place-filter-id', on_place_change);
}

$(document).on('ready page:load', function() {
    if ($('.tracks-index').length) {
        // init();
    }
});
