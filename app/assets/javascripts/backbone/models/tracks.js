SkyDerby.Models.Tracks  = Backbone.Model.extend({
  paramRoot: 'track',

  defaults: {
    title: null,
    content: null
  }
});

SkyDerby.Collections.TracksCollection = Backbone.Collection.extend({
  model: SkyDerby.Models.Tracks,
  url: '/api/tracks',
  kind: function(track_kind){
		return _(this.filter(function(data) {
		  	return data.get("kind") == track_kind;
		}));
	},
});
