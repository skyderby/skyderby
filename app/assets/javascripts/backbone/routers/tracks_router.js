SkyDerby.Routers.TracksRouter = Backbone.Router.extend({
    initialize: function(options) {
        this.tracks = new SkyDerby.Collections.TracksCollection();
        return this.tracks.reset(options.tracks);
    },

    routes: {
        "(?*queryString)": "index"
    },

    index: function(query_string) { 
        var params = parseQueryString(query_string);
        this.view = new SkyDerby.Views.Tracks.IndexView({collection: this.tracks, params: params});
        $("#tracks").html(this.view.render().el);
    }
});
