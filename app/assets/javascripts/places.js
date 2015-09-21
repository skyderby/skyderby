$(document).on('ready page:load', function() {
    if ($('#places-index').length) {
        var places_collection = new Skyderby.collections.Places();
        places_collection.set($('#places-index').data('places'));

        var view = new Skyderby.views.PlacesIndex({
            collection: places_collection,
            el: '#places-index'
        });
        view.render();
    }
});
