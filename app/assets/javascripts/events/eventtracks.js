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

    this.$form_result_track = $('#result-track');

    this.$form_upload_file = $('#new-result-from-new-track');
    this.$form_choose_track = $('#new-result-from-exist-track');
    this.$form_delete_result = $('#rm-button-delete-result');

    $.extend(this, params);    

    this.is_new = !this.id;
}

Event.EventTrack.prototype = {
    open_form: function() {
        if (this.is_new) {
            modal_title = 'Добавление';
            this.$form_delete_tab.hide();
        } else {
            modal_title = 'Редактирование';
            this.$form_delete_tab.show();
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

        this.$form_upload_file
            .off('click')
            .on('click', this.upload_file.bind(this));

        this.$form_choose_track
            .off('click')
            .on('click', this.choose_track.bind(this));

        this.$form_delete_result
            .off('click')
            .on('click', this.delete_result.bind(this));

        this.$form.modal('show');
    },

    upload_file: function() {
        alert('upload');
    },

    choose_track: function() {
        alert('choose');
    },

    delete_result: function() {
        alert('delete');
    },
}
