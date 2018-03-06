import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    $(this.element).validate({
      rules: {
        'user[name]': {
          minlength: 3,
          required: true
        },
        'user[email]': {
          required: true,
          email: true
        },
        'user[password]': {
          required: true
        },
        'user[password_confirmation]': {
          required: true,
          equalTo: '.new-user-form #user_password'
        }
      },
      highlight: function(element) {
        $(element).closest('.form-group').addClass('has-error');
      },
      unhighlight: function(element) {
        $(element).closest('.form-group').removeClass('has-error');
      }
    })
  }
}
