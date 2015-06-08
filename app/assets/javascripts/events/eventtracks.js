var Event = Event || {};

Event.EventTrack = function(params) {
    this.id = '';
    this.round_id = '';
    this.competitor_id = '';
    this.track_id = '';
    this.result = '';
    this.url = '';
    this.track_presentation = '';
    this.uploaded_by = {};

    this.$progress_modal = $('#progress-modal');
    this.$progress_progress_tab = $('#progress-modal .progress-tab');
    this.$progress_progress_bar = $('#progress-modal .progress-bar')
    this.$progress_process_tab = $('#progress-modal .process-tab');

    $.extend(this, params);    

    this.is_new = !this.id;
}

Event.EventTrack.prototype = {
    open_form: function() {
        if (this.is_new) {
            new Event.NewResultModal(this).open();
        } else {
            new Event.ShowResultModal(this).open();
        }
    },

    beforeSendHandler: function() {
        this.$progress_modal.modal('show');
        this.$progress_progress_tab.show();
        this.$progress_process_tab.hide();

        this.$progress_progress_bar
            .css('width', '0%')
            .attr('aria-valuenow', 0);
    },

    ajax_send_handler: function() {
        this.$progress_progress_tab.hide();
        this.$progress_process_tab.show();
    },

    progressHandlingFunction: function(e) {
        if (e.lengthComputable){
            var progress = Math.round(e.loaded / e.total * 100);
            this.$progress_progress_bar
                .css('width', progress + '%')
                .attr('aria-valuenow', progress);
        }
    },

    completeHandler: function() {
        this.$progress_modal.modal('hide');    

        $(document).off('ajaxSend', this.ajax_send_handler);
    },

    save: function(params) {
        var url, method, data;

        if (this.is_new) {
            url = window.Competition.path + '/event_tracks/';
            method = 'POST';
        } else {
            url = window.Competition.path + '/event_tracks/' + this.id;
            method = 'PATCH';
        }

        data = {
            event_track: {
                round_id: this.round_id,
                competitor_id: this.competitor_id,
                track_id: this.track_id
            }
        };

        data = new FormData();
        data.append('event_track[round_id]', this.round_id);
        data.append('event_track[competitor_id]', this.competitor_id);
        if (params.track_id) {
            data.append('event_track[track_id]', params.track_id);
        } else {
            var cur_competitor = window.Competition.competitor_by_id(this.competitor_id);

            data.append('event_track[track_attributes[file]]', params.track_file);
            data.append('event_track[track_attributes[user_profile_id]]', cur_competitor.profile.id);
            data.append('event_track[track_attributes[wingsuit_id]]', cur_competitor.wingsuit.id);
        }

        $(document).on('ajaxSend', this.ajax_send_handler.bind(this));

        var self = this;
        $.ajax({
            url: url,
            method: method,
            xhr: function() {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if(myXhr.upload){ // Check if upload property exists
                    myXhr.upload.addEventListener('progress', self.progressHandlingFunction.bind(self), false); // For handling the progress of the upload
                }
                return myXhr;
            },
            //Ajax events
            beforeSend: this.beforeSendHandler.bind(this),
            complete: this.completeHandler.bind(this),
            dataType: 'json',
            data: data,
            cache: false,
            contentType: false,
            processData: false
        })
            .done(this.after_save.bind(this))
            .fail(fail_ajax_request);
    },

    destroy: function() {
        $.ajax({
            url: window.Competition.path + '/event_tracks/' + this.id,
            method: 'DELETE',
            dataType: 'json',
            context: {id: this.id}
        })
            .done(this.after_destroy.bind(this))
            .fail(fail_ajax_request);
    },

    after_save: function(data, status, jqXHR) {
        $.extend(this, data);
        this.is_new = !this.id;

        window.Competition.on_result_save(this);
},

    after_destroy: function() {
        window.Competition.on_result_delete(this);
    },
}
