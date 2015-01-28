function on_filter_change() {
    alert($(this).val());
}
$(document).on('change', 'input:radio[name="track-kind"]', on_filter_change)
    .on('change', '#wingsuit-filter-id', on_filter_change)
    .on('change', '#place-filter-id', on_filter_change);

$(document).on('ready page:load', function() {
    if ($('.tracks-index').length) {
    }
});
