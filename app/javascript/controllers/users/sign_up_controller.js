import { Controller } from 'stimulus'

export default class extends Controller {
  connect() {
    $(this.element).validate({
      rules: {
        'user[profile_attributes][name]': {
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
      highlight: function (element) {
        element.closest('.form-group').classList.add('has-error')
      },
      unhighlight: function (element) {
        element.closest('.form-group').classList.remove('has-error')
      }
    })
  }
}
