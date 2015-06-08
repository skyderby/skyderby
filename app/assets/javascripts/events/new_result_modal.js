var Event = Event || {};

Event.NewResultModal = function(result) {
    this.result = result;
    this.competitor = {};
    this.round = {};

    this.$dialog = $('#new-result-modal');
    this.$elements = {
        form: $('#result-form'),
        title: $('#result-form-modal-title'),
        toggle_track: $('.toggle-track'),
        toggle_track_caption: $('.toggle-track-caption'),

        track_file_group: $('.track-file-group'),
        track_file_input: $('.track-file-input'),
        track_file_name: $('.track-file-name'),

        result_track: $('#result-track'),
        save: $('#rm-save'),
        //this.$form_new_track_wrap = $('#rm-new-track');
    };

    this.init();
}

Event.NewResultModal.prototype = {
    init: function() {
        this.competitor = window.Competition.competitor_by_id(this.result.competitor_id);
        this.round = window.Competition.round_by_id(this.result.round_id);

        this.init_track_select();
    },

    open: function() {
        this.$elements.title.text(this.get_title());

        this.$elements.save
            .off('click')
            .on('click', this.form_save.bind(this));

        this.$dialog.modal('show');
    },

    get_title: function() {
        return 'Result: ' + this.competitor.profile.name + ' in ' +
            capitaliseFirstLetter(this.round.discipline) + ' - ' + this.round.name;
    },

    init_track_select: function() {
        this.$elements.result_track.find('option').remove();

        var competitor = this.competitor;
 
        this.$elements.result_track.select2({
            width: '100%',
            placeholder: "Choose track from list",
            dropdownParent: this.$dialog,
            ajax: {
                url: '/tracks',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    term.profile_id = competitor.profile.id;
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

        this.$elements.toggle_track
            .off('click')
            .on('click', this.on_toggle_track.bind(this));

        this.$elements.toggle_track.data('state', 'list');
        this.on_toggle_track();
    },

    on_toggle_track: function(e) {
        if (e) {
            e.preventDefault();
        }
        // Если состояние = выбор из списка
        if (this.$elements.toggle_track.data('state') == 'file') {
            // Переключаем в режим загрузки из файла
            // Скрываем группу выбора файла и меняем надпись
            this.$elements.toggle_track.data('state', 'list').text('upload new one');
            this.$elements.toggle_track_caption.text("Or");
            this.$elements.track_file_group.hide();
            this.$elements.track_file_input.val('');
            this.$elements.track_file_name.val('');
            $('.result-track + span').show();
        } else {
            this.$elements.toggle_track.data('state', 'file').text('select existed track');
            this.$elements.toggle_track_caption.text("Or");
            this.$elements.track_file_group.show();
            this.$elements.result_track.select2('val', '');
            $('.result-track + span').hide();
        }
    },

    form_save: function(e) {
        e.preventDefault();
        this.$dialog.modal('hide');

        this.result.save({
            track_id: this.$elements.result_track.val(),
            track_file: this.$elements.track_file_input[0].files[0]
        });        
    },
}
