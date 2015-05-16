var Event = Event || {};

Event.Organizer = function(params) {
    this.id = '';
    this.event_id = '';
    this.user_profile_id = '';
    this.user_profile_name = '';

    $.extend(this, params);
    this.is_new = !this.id;
}

Event.Organizer.prototype = {

    save: function() {
        var url, method, data;

        url = window.Competition.path + '/event_organizers/';
        method = 'POST';

        data = {
            event_organizer: {
                user_profile_id: this.user_profile_id,
                event_id: window.Competition.id
            }
        };

        $.ajax({
            url: url,
            method: method,
            dataType: 'json',
            data: data
        })
            .done(this.after_save.bind(this))
            .fail(fail_ajax_request);
    },

    destroy: function() {
        $.ajax({
            url: window.Competition.path + '/event_organizers/' + this.id,
            method: 'DELETE',
            dataType: 'json',
            context: {id: this.id}
        })
            .done(this.after_destroy.bind(this))
            .fail(fail_ajax_request);
    },

    after_save: function(data, status, jqXHR) {
        $.extend(this, data);
        window.Competition.on_organizer_save(this);
    },

    after_destroy: function() {
        window.Competition.on_organizer_delete(this);
    },

}
