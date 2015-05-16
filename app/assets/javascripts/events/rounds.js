var Event = Event || {};

Event.Round = function(params) {
    this.id = '';
    this.event_id = ''; 
    this.name = '';
    this.discipline = '';

    $.extend(this, params);
    this.is_new = !this.id;
}

Event.Round.prototype = {
    save: function() {
        var url, method, data;
        
        url = window.Competition.path + '/rounds/';

        if (this.is_new) {
            method = 'POST';
        } else {
            url += this.id;
            method = 'PATCH';
        }

        data = {
            round: {
                discipline: this.discipline,
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
            url: window.Competition.id + '/rounds/' + this.id,
            method: 'DELETE',
            dataType: 'json',
            context: {id: this.id}
        })
            .done(this.after_destroy.bind(this))
            .fail(fail_ajax_request);

    },

    after_save: function(data, status, jqXHR) {
        var is_new = this.is_new;

        $.extend(this, data);
        this.is_new = !this.id;

        if (is_new) {
            window.Competition.on_round_create(this);
        } else {
            window.Competition.on_round_update(this);
        }

    },

    after_destroy: function() {
        window.Competition.on_round_delete(this);
    }
}
