Skyderby.views.EventForm = Backbone.View.extend({

    template: JST['app/templates/event_form'],

    tagName: 'div',

    className: 'modal-dialog',

    events: {
        'submit #event-form': 'onSubmit'
    },

    initialize: function() {
        this.modalView = new Skyderby.views.ModalView();
    },

    render: function() {
        var modalTitle = I18n.t('activerecord.models.event') + ': ' + 
            (this.model.isNew() ? 
                I18n.t('events.show.new') : 
                I18n.t('events.show.edit'));

        this.modalView.$el.html(
            this.$el.html(this.template({title: modalTitle}))
        );

        this.listenTo(this.modalView, 'modal:shown', this.onModalShown);
        this.listenTo(this.modalView, 'modal:hidden', this.onModalHidden);

        $('#event-form input[name="event[id]"]').val(this.model.get('id'));
        $('#event-form input[name="event[name]"]').val(this.model.get('name'));

        $('#event-form input[name="event[starts_at]"]')
            .val(this.model.get('starts_at'))
            .datepicker({
                format: 'dd.mm.yyyy',
                startDate: 0,
                language: I18n.locale,
                autoclose: true,
                todayHighlight: true
            });

        $('#event-form input[name="event[range_from]"]').val(this.model.get('range_from'));
        $('#event-form input[name="event[range_to]"]').val(this.model.get('range_to'));

        this.init_place_select();

        $('input:radio[name="event[status]"][value=' + this.model.get('status') + ']').prop('checked');
        $('#' + this.model.get('status') + '-label').addClass('active');

        return this;
    },

    open: function() {
        this.modalView.show();
        return this;
    },

    onModalShown: function() {
        $('#event-form input[name="event[name]"]').focus();
    },

    onModalHidden: function() {
        this.$el.remove();
    },

    onSubmit: function(e) {
        e.preventDefault();
        var params = {
            name:       $('#event-form input[name="event[name]"]').val(),
            starts_at:  $('#event-form input[name="event[starts_at]"]').val(),
            range_from: $('#event-form input[name="event[range_from]"]').val(),
            range_to:   $('#event-form input[name="event[range_to]"]').val(),
            status:     $('#event-form input:radio[name="event[status]"]').filter(':checked').val(),
            place_id:   $('#event-form select[name="event[place_id]"]').val()
        };

        this.model.set(params);
        this.model.save({wait: true});
        this.modalView.hide();
    },

    init_place_select: function() {
        var place_el = $('#event-form select[name="event[place_id]"]');

        place_el.find('option').remove();

        if (this.model.has('place')) {
            var current_place = this.model.get('place');
            place_el.append($('<option />', {value: current_place.id, text: current_place.name}));
            place_el.append($('<option />', {value: ''}));
        }       
 
        place_el.select2({
            theme: 'bootstrap',
            width: '100%',
            placeholder: I18n.t('events.show.place_placeholder'),
            allowClear: true,
            ajax: {
                url: '/places',
                dataType: 'json',
                type: "GET",
                quietMillis: 50,
                data: function (term) {
                    return {
                        query: term
                    };
                },
                processResults: function (data) {
                    var places_data = _.chain(data)
                        .map(function(obj) {
                            return {
                                id: obj.id,
                                text: obj.name,
                                country: obj.country.name
                            };
                        })
                        .groupBy(function(obj) { 
                            return obj.country;
                        })
                        .map(function(obj, key) {
                            return {
                                text: key, 
                                children: obj
                            };
                        })
                        .sortBy(function(obj) {
                            return obj.text;
                        })
                        .value();
                    return {
                        results: places_data
                    };
                },
                cache: true
            }
        });
    },
});
