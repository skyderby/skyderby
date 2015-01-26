if (!SkyDerby.Views.Tracks) {
    SkyDerby.Views.Tracks = {};
}

SkyDerby.Views.Tracks.IndexView = Backbone.View.extend({
    template: JST["backbone/templates/tracks/index"],

    initialize: function(options) {
        this.params = options.params;
        return this.collection.bind('reset', this.addAll);
    },

    events: {
        'change input:radio[name="track-kind"]': 'filter_by_kind'
    },
    
    addAll: function() {
        var self = this;
        var elements = null;
        if (this.params && this.params.kind && this.params.kind !== 'all') {
            elements = this.collection.kind(this.params.kind);
        } else {
            elements = this.collection;
        }
        this.renderList(elements);

        // this.collection.each(function(track) {
        //     self.$('tbody').append(self.addOne(track));
        // });
    },

    addOne: function(track) {
        var view = new SkyDerby.Views.Tracks.TrackView({model : track});
        return view.render().el;
    },

    render: function() {
        this.$el.html(this.template({
            tracks: this.collection.toJSON()
        }));
        this.addAll();

        return this;
    },

    renderList : function(tracks){
		var container = this.$("tbody");
        container.html("");
 
		tracks.each(function(track){
			var view = new SkyDerby.Views.Tracks.TrackView({model : track});
			container.append(view.render().el);
		});
		return this;
	},

    filter_by_kind: function(e) {
        var kind = $(e.currentTarget).val();
        var query_string = '#';
        if (kind !== 'all') {
            query_string += '?kind=' + kind;
        }
        window.router.navigate(query_string, true);
    }

});
