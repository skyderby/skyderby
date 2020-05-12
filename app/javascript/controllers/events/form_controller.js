import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['only_hungary_boogie']

  connect() {
    this.set_form_validation()

    const rules = this.element.querySelector('[name="event[rules]"]:checked').value
    this.set_fields_visibility(rules)
  }

  on_change_rules(event) {
    if (event.currentTarget.hasAttribute('disabled')) {
      event.stopPropagation()
      return
    }

    const rules = event.currentTarget.querySelector('input').value
    this.set_fields_visibility(rules)
  }

  set_fields_visibility(rules) {
    const visibility = rules === 'hungary_boogie' ? 'block' : 'none'
    this.only_hungary_boogieTargets.forEach(element => {
      element.style.display = visibility
    })
  }

  set_form_validation() {
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
        'event[place_id]': {
          required: true
        }
      },
      highlight: function (element) {
        $(element).closest('.form-group').addClass('has-error')
      },
      unhighlight: function (element) {
        $(element).closest('.form-group').removeClass('has-error')
      },
      errorPlacement: (error, element) => {
        if (element.attr('name') == 'event[place_id]') {
          error.appendTo(element.closest('div'))
        } else {
          error.insertAfter(element)
        }
      }
    })
  }
}
