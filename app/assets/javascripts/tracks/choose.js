$(document).on('ready page:load', function() {
    $('.track-segment-row')
        .off('click')
        .on('click', function(e) {
            e.preventDefault();
            $('#track_track_index').val($(this).data('index'));
            $('#select-segment-form').submit();
        });
});
