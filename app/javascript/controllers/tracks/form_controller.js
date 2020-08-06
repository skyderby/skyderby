import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    this.initFormValidations()
  }

  initFormValidations() {
    $(this.element).validate({
      ignore: 'input[type=hidden]',
      rules: {
        'track_file[track_attributes][name]': {
          minlength: 3,
          required: () => $('#newTrackModal input#name')
        },
        'track_file[track_attributes][suit_id]': {
          required: () =>
            $('[name="track_file[track_attributes][suit_id]"]').is(':visible')
        },
        'track_file[track_attributes][missing_suit_name]': {
          required: () =>
            $('[name="track_file[track_attributes][missing_suit_name]"]').is(':visible')
        },
        'track_file[track_attributes][location]': {
          minlength: 3,
          required: true
        },
        'track_file[file]': {
          required: true,
          accept: '.*',
          extension: 'csv|gpx|tes|kml',
          filesize: 3145728 // 3 Mb
        }
      },
      messages: {
        'track_file[file]': {
          extension: 'Please enter file with valid extension (csv, gpx, tes, kml)',
          filesize: 'File should be less than 3MB'
        },
        'track_file[track_attributes][suit]': {
          require_from_group: 'This field is required.'
        }
      },
      highlight: element => {
        $(element).closest('.form-group').addClass('has-error')
      },
      unhighlight: element => {
        $(element).closest('.form-group').removeClass('has-error')
      },
      errorPlacement: (error, element) => {
        if (element.attr('name') == 'track_file[file]') {
          error.appendTo(element.closest('.col-sm-9'))
        } else if (element.hasClass('suit-group')) {
          error.appendTo(element.closest('div'))
        } else {
          error.insertAfter(element)
        }
      }
    })
  }
}
