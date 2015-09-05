Skyderby.models.EventTrack = Backbone.Model.extend({

    paramRoot: 'event_track',

    methodMap: {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read'  : 'GET'
    },

    sync: function(method, model, options) {
        var type = this.methodMap[method];
        if (type == 'DELETE' || type == 'GET') {
            return Backbone.sync(method, model, options);
        } else {
            var form = new FormData();
            if (!this.isNew()) {
                form.append('event_track[id]', this.get('id'));
            }

            form.append('event_track[round_id]', this.get('round_id'));
            form.append('event_track[competitor_id]', this.get('competitor_id'));

            if (this.has('track_id')) {
                form.append('event_track[track_id]', this.get('track_id'));
            } else {
                form.append('event_track[track_attributes[file]]', this.get('track_file'));
                form.append('event_track[track_attributes[user_profile_id]]', this.get('user_profile_id'));
                form.append('event_track[track_attributes[wingsuit_id]]', this.get('wingsuit_id'));
            }
            
            var url = this.url();
            if (_.has(options, 'url')) url = options.url;

            var params = {
                url: url, 
                method: type,
                dataType: 'json',
                data: form,
                cache: false,
                contentType: false,
                processData: false
            };

            var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
            model.trigger('request', model, xhr, options);
            return xhr;
        }
    }
});
