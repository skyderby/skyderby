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
//= require jquery.remotipart
//= require turbolinks
//= require bootstrap-datepicker/core
//= require bootstrap-datepicker/locales/bootstrap-datepicker.ru.js
//= require bootstrap-datepicker/locales/bootstrap-datepicker.de.js
//= require bootstrap-datepicker/locales/bootstrap-datepicker.es.js
//= require twitter/bootstrap/alert
//= require twitter/bootstrap/button
//= require twitter/bootstrap/dropdown
//= require twitter/bootstrap/modal
//= require twitter/bootstrap/tab
//= require twitter/bootstrap/tooltip
//= require jquery.validate
//= require additional-methods.min
//= require markerclusterer
//= require ion.rangeSlider
//= require jquery.cookie
//= require select2.full
//= require i18n/translations
//= require underscore
//= require backbone
//= require backbone_rails_sync
//= require backbone_datalink
//= require highcharts
//= require highcharts-more
//= require app/app
//= require_tree ./events
//= requiew_tree ./common
//= require_self

$(document).on('ready turbolinks:load', function() {

    $('input[type=number]').keypress(function (e) {
        //if the letter is not digit then don't type anything
        if (e.which !== 8 && e.which !== 0 && (e.which < 48 || e.which > 57)) {
            return false;
        }
    });

    $('.datepicker').datepicker({
        format: 'dd.mm.yyyy',
        startDate: 0,
        language: I18n.locale,
        autoclose: true,
        todayHighlight: true
    });

    $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
        
        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;
        
        if( input.length ) {
            input.val(log);
        }
    });

    window.AjaxErrorMessage = new Skyderby.views.AjaxErrorMessage();
});

$(document).on('change', '.btn-file :file', function() {

  var input = $(this),
      numFiles = input.get(0).files ? input.get(0).files.length : 1,
      label = input.val().replace(/\\/g, '/').replace(/.*\//, '');

  input.trigger('fileselect', [numFiles, label]);

});

$(document).on('click', '.clickableRow', function() {
    Turbolinks.visit($(this).data("url"));
});

$(document).on('turbolinks:load', function() {
    // Enable tooltips
    $('body').tooltip({selector: "a[rel~=tooltip], .has-tooltip, [data-toggle=tooltip]"});

    // Enable tabs
    $('body').delegate('click', '[data-toggle=tab] > a', function(e) {
        e.preventDefault();
        $(this).tab('show');
    });

    ga('send', 'pageview', window.location.pathname); 
});
