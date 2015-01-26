if (!SkyDerby.Views.Tracks) {
   SkyDerby.Views.Tracks = {};
}

SkyDerby.Views.Tracks.TrackView = Backbone.View.extend({
  template: JST["backbone/templates/tracks/track"],

  events: {
    "click .destroy" : "destroy"
  },

  tagName: "tr",
  
  className: 'clickableRow',

  destroy: function() {
    this.model.destroy();
    this.remove();

    return false;
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON() ));
    this.$el.attr('data-url', this.model.attributes.url);
    return this;
  }
});
