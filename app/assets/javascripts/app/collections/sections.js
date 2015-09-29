Skyderby.collections.Sections = Backbone.Collection.extend({

    model: Skyderby.models.Section,

    initialize: function(opts) {
        if (_.has(opts, 'parent_url')) this.url = opts.parent_url + '/sections';
    },

    move_up: function(section) {
        var index = this.indexOf(section);

        if (index > 0) this.swap(this.at(index - 1), section);
        return this;
    },

    move_down: function(section) {
        var index = this.indexOf(section);

        if (index < (this.length - 1)) this.swap(this.at(index + 1), section);
        return this;
    },

    swap: function(a, b) {
        var tmp_order = a.get('order');
        a.set('order', b.get('order'));
        b.set('order', tmp_order);

        this.sort();
        return this;
    },

    nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
    },

    comparator: 'order'
});
