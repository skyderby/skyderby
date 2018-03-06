import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    $(this.element).validate({
      rules: {
        'user[email]': {
          required: true,
          email: true
        },
        'user[password]': {
          required: true
        }
      },
      highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
      },
      unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
      }
    });
  }
}
