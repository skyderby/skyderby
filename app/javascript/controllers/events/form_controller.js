import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    $(this.element).validate({
      ignore: 'input[type=hidden]',
      rules: {
        'event[name]': {
          minlength: 3,
          required: true
        },
        'event[range_from]': {
          required: true
        },
        'event[range_to]': {
          required: true
        },
      },
      highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
      },
      unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
      },
    });
  }
}
