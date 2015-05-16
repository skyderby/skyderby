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
//= require vendor/jquery.validate
//= require vendor/additional-methods.min
//= require i18n/translations
//= require_tree .

//"use strict";


Turbolinks.enableProgressBar();


$.validator.addMethod('filesize', function(value, element, param) {
    // param = size (en bytes) 
    // element = element to validate (<input>)
    // value = value of the element (file name)
    return this.optional(element) || (element.files[0].size <= param) 
});

function fail_ajax_request(data, status, jqXHR) {
    var error_text = '';
    var errors_count = 0;

    if (data.responseJSON) {
        $.each(data.responseJSON, function(key, val) {
            $.each(data.responseJSON[key], function(ind, val) {
                error_text += '- ' + val + '\n';
                errors_count += 1;
            })
        });
    } else {
        error_text = data.responseText.substring(0, 500);
        errors_count += 1;
    }
    error_text = I18n.t('errors.messages.not_saved', {count: errors_count}) + '\r\n' + error_text;
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

var bootstrap_alert = function() {};
bootstrap_alert.warning = function(message, placeholder) {
    $(placeholder).append('<div class="alert alert-danger alert-dismissible"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><span>'+message+'</span></div>');
};

function checkfile() {
    var placeholder = '#' + $(this).data('placeholder'),
        warnings = $(this).data('warnings'),
        file_list = this.files;

    if (placeholder !== '#') {
        $(placeholder).empty();
    }

    for (var i = 0, file; file = file_list[i]; i++) {
      var filename = file.name;
      var fileextension = filename.split('.')[filename.split('.').length - 1].toLowerCase();
      var filesize = file.size;
      var filesizemb = (file.size / 1048576).toFixed(2);
      var txt = "";

      if (!(fileextension === "gpx" || fileextension === "csv" || fileextension === "tes"))  {
          txt += warnings.ext_w1 + fileextension + "\n\n";
          txt += warnings.ext_w2;
      }
      if (filesize > 1048576) {
          txt += warnings.size_w1 + filesizemb + " мб \n\n";
          txt += warnings.size_w2;
      }
      if ((txt !== "") && (placeholder !== '#')) {
          bootstrap_alert.warning(txt, '#rm-alert-placeholder');
          $(this).val("");
      }
    }
}

$(document).ready(function($) {

    $(".track-file-input").on('change', checkfile);

    $('.user-autocomplete').autocomplete({
        serviceUrl: '/users/autocomplete',
        onSelect: function (suggestion) {
            var idfield = $(this).data('idfield');
            $(idfield).val(suggestion.data);
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
        } else {
            if( log ) alert(log);
        }
        
    });

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


$(document).on('ready page:load', function() {
    // Init tooltips
    $('[data-toggle="tooltip"]').tooltip();
    
    // ONLY if page has one pagination!
    if ($('.pagination').length) {
        $(window).off('scroll').on('scroll', function() {
            var url = $('.pagination .next > a').attr('href');
            if (url && ($(window).scrollTop() >= $(document).height() - $(window).height() - 170)) {
                $('.pagination').text('Fetching more tracks...')
                $.getScript(url);
            }
        });
        $(window).scroll();
    } else {
        $(window).off('scroll');
    }

});
