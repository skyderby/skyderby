// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require jquery.turbolinks
//= require bootstrap-datepicker/core
//= require bootstrap-datepicker/locales/bootstrap-datepicker.ru.js
//= require twitter/bootstrap
//= require gmaps/google
//= require_tree .

function clone(obj) {
    if (null === obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}

$(document).ready(function($) {

    $(".clickableRow").click(function() {
        Turbolinks.visit($(this).data("url"));
    });

    $('.user-autocomplete').autocomplete({
        serviceUrl: '/users/autocomplete',
        onSelect: function (suggestion) {
            var idfield = $(this).data('idfield');
            $(idfield).val(suggestion.data);
        }
    });

    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show');

    $('.nav-tabs a').click(function (e) {
        $(this).tab('show');
        var scrollmem = $('body').scrollTop();
        window.location.hash = this.hash;
        $('html,body').scrollTop(scrollmem);
    });

    var ws_field = $('.wingsuit-autocomplete');
    ws_field.autocomplete({
        serviceUrl: '/wingsuits/autocomplete',
        params: {event_id: ws_field.data("event")},
        onSelect: function (suggestion) {

            var idfield = $(this).data('idfield');
            var ws_id_field = $(idfield);
            if (ws_id_field !== 'undefined') {
                ws_id_field.val(suggestion.data);
            }

            var ws_class_field = $('#wingsuit-class');
            if (ws_class_field !== 'undefined'){
                ws_class_field.text(suggestion.ws_class);
            }
        },
        categories: true
    });

    $('.datepicker').datepicker({
        format: 'dd.mm.yyyy',
        startDate: 0,
        language: 'ru',
        autoclose: true,
        todayHighlight: true
    });

});
