var Event = Event || {};

Event.EventTrack = function(params) {
    this.id = '';
    this.round_id = '';
    this.competitor_id = '';
    this.track_id = '';
    this.result = '';
    this.url = '';
    this.track_presentation = '';

    this.$form = $('#result-form-modal');
    this.$form_title = $('#result-form-modal-title');
    this.$form_delete_tab = $('#rm-li-delete-result');
    this.$form_competitor = $('#rm-competitor-name');
    this.$form_round = $('#rm-round-name');
    this.$form_track_label = $('#rm-track-label');
    this.$form_track_link = $('#rm-track-link');
    this.$form_new_track_wrap = $('#rm-new-track');

    this.$form_result_track = $('#result-track');

    this.$form_save = $('#rm-save');
    this.$form_delete_result = $('#rm-delete');

    $.extend(this, params);    

    this.is_new = !this.id;
}

Event.EventTrack.prototype = {
    open_form: function() {
        if (this.is_new) {
            modal_title = 'Добавление';
            this.$form_track_label.hide();
            this.$form_track_link.hide();
            this.$form_delete_result.hide();
            this.$form_new_track_wrap.show();
        } else {
            modal_title = 'Редактирование';
            this.$form_new_track_wrap.hide();
            this.$form_track_label.show();
            this.$form_track_link.show();
            this.$form_delete_result.show();

            this.$form_track_link
                .text('#' + this.track_id)
                .attr('href', this.url);
        }

        var competitor = window.Competition.competitor_by_id(this.competitor_id);
        var round = window.Competition.round_by_id(this.round_id);

        this.$form_title.text('Результат: ' + modal_title);
        this.$form_competitor.text(competitor.profile.name);
        this.$form_round.text(capitaliseFirstLetter(round.discipline) + ' - ' + round.name);

        this.$form_result_track.find('option').remove();
        if (!this.is_new) {
            $('<option />', {value: this.track_id, text: this.track_presentation})
                .appendTo(this.$form_result_track);
        }       
 
        this.$form_result_track.select2({
            width: '100%',
            // placeholder: "Search for an Item",
            dropdownParent: this.$form,
            // minimumInputLength: 2,
            ajax: {
                url: '/api/tracks',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    return {
                        query: term
                    };
                },
                processResults: function (data) {
                    return {
                        results: $.map(data, function (item) {
                            return {
                                text: item.presentation,
                                id: item.id
                            }
                        })
                    };
                },
                cache: true
            }
        });

        $('input[name=source][value=file]').closest('label').addClass('active');

        this.$form_save
            .off('click')
            .on('click', this.form_save.bind(this));

        this.$form_delete_result
            .off('click')
            .on('click', this.delete_result.bind(this));

        this.$form.modal('show');
    },

    form_save: function(e) {
        e.preventDefault();

        this.track_id = this.$form_result_track.val();
        this.save();        

        this.$form.modal('hide');
    },

    delete_result: function(e) {
        e.preventDefault();
        this.destroy();
        this.$form.modal('hide');
    },

    save: function() {
        var url, method, data;

        if (this.is_new) {
            url = '/api/round_tracks/';
            method = 'POST';
        } else {
            url = '/api/round_tracks/' + this.id;
            method = 'PATCH';
        }

        data = {
            round_track: {
                round_id: this.round_id,
                competitor_id: this.competitor_id,
                track_id: this.track_id
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
            url: '/api/round_tracks/' + this.id,
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
