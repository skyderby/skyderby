Skyderby.models.EventSponsor = Backbone.Model.extend({

    paramRoot: 'event_sponsor',

    defaults: {
        name: '',
        logo_url: '/logos/medium/missing.png',
        website: ''
    },

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
                form.append('event_sponsor[id]', this.get('id'));
            }
            form.append('event_sponsor[name]', this.get('name'));
            form.append('event_sponsor[website]', this.get('website'));
            form.append('event_sponsor[logo]', this.get('logo'));
            
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
