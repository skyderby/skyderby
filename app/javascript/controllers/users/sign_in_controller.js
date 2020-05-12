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
      highlight: function (element) {
        element.closest('.form-group').classList.add('has-error')
      },
      unhighlight: function (element) {
        element.closest('.form-group').classList.remove('has-error')
      }
    })
  }
}
