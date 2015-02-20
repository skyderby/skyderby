var Event = Event || {};

Event.Round = function(params) {
    this.id = '';
    this.event_id = ''; 
    this.name = '';
    this.discipline = '';

    this.$form = $('#round-form-modal');
    $.extend(this, params);
}

Event.Round.prototype = {
    open_form: function() {
        $('#round-form-modal-title').text('Раунд: Добавление');
        this.$form.modal('show');

    }
}
