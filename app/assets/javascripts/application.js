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
//= require remotipart/jquery.remotipart
//= require turbolinks
//= require bootstrap-datepicker/core
//= require bootstrap-datepicker/locales/bootstrap-datepicker.ru.js
//= require bootstrap-datepicker/locales/bootstrap-datepicker.de.js
//= require bootstrap-datepicker/locales/bootstrap-datepicker.es.js
//= require twitter/bootstrap/alert
//= require twitter/bootstrap/button
//= require twitter/bootstrap/dropdown
//= require twitter/bootstrap/modal
//= require twitter/bootstrap/tooltip
//= require jquery.validate
//= require additional-methods.min
//= require markerclusterer
//= require ion.rangeSlider
//= require jquery.cookie
//= require select2.min
//= require i18n/translations
//= require underscore
//= require backbone
//= require backbone_rails_sync
//= require backbone_datalink
//= require highcharts
//= require highcharts-more
//= require app/app
//= require_tree .

// Bootstrap registers a listener to the focusin event which checks whether 
// the focused element is either the overlay itself or a descendent of it - 
// if not it just refocuses on the overlay. With the select2 dropdown being 
// attached to the body this effectively prevents you from entering anything 
// into the the textfield.
$.fn.modal.Constructor.prototype.enforceFocus = function() {};

$.validator.addMethod('filesize', function(value, element, param) {
    // param = size (en bytes) 
    // element = element to validate (<input>)
    // value = value of the element (file name)
    return this.optional(element) || (element.files[0].size <= param);
});

function fail_ajax_request(model, data) {
    var error_text = '';
    var errors_count = 0;

    if (data.responseJSON) {
        $.each(data.responseJSON, function(key) {
            $.each(data.responseJSON[key], function(ind, val) {
                error_text += '- ' + val + '\n';
                errors_count += 1;
            });
        });
    } else {
        error_text = data.responseText.substring(0, 500);
        errors_count += 1;
    }
    error_text = I18n.t('errors.messages.not_saved', {count: errors_count, resource: 'object'}) + '\r\n' + error_text;
    AjaxErrorMessage.display(error_text);
}

function clone(obj) {
    if (null === obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

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

});

$(document).on('ajax:error', '[data-remote=true]', function() {
    AjaxErrorMessage.display()
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

    ga('send', 'pageview', window.location.pathname); 
});
