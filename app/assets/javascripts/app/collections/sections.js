Skyderby.collections.Sections = Backbone.Collection.extend({

    model: Skyderby.models.Section,

    nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
    },

    comparator: 'order'
});
