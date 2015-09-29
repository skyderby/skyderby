Skyderby.views.PlaceForm = Backbone.View.extend({
    initialize: function() {
        Skyderby.helpers.countrySelect($('.place-form select[name="place[country_id]"]'));
        Skyderby.helpers.placeValidation($('.place-form'));
    }
});
