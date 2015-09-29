Skyderby.models.Competitor = Backbone.Model.extend({
    paramRoot: 'competitor',

    permitted_params: ['profile_id', 'profile_name', 'wingsuit_id', 'section_id'],

    save: function(attrs, options) {
        if (!options) options = {};
        if (!attrs) attrs = _.clone(this.attributes);

        // Filter the data to send to the server
        attrs = _.pick(attrs, this.permitted_params);

        var data = {};
        data[this.paramRoot] = attrs;

        options.contentType = "application/json";
        options.data = JSON.stringify(data);

        // Proxy the call to the original save function
        return Backbone.Model.prototype.save.call(this, {}, options);
    }

});
