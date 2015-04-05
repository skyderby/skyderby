var filters = {};

function on_filter_change() {

}

function init() {
    $(document).on('change', 'input:radio[name="filter[kind]"]', on_kind_change)
        .on('change', '#wingsuit-filter-id', on_suit_change)
        .on('change', '#place-filter-id', on_place_change);
}

$(document).on('ready page:load', function() {
    if ($('.pagination').length) {
        $(window).off('scroll').on('scroll', function() {
            var url = $('.pagination .next_page').attr('href');
            if (url && $(window).scrollTop() > $(document).height() - $(window).height() - 130) {
                $('.pagination').text('Fetching more tracks...')
                $.getScript(url);
            }
        });
        $(window).scroll();
    } else {
        $(window).off('scroll');
    }
    if ($('.tracks-index').length) {
        // init();
    }
});
