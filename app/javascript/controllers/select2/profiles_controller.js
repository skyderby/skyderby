import { BaseController } from 'controllers/select2/base_controller'

export default class extends BaseController {
  get options() {
    var options = {
      ajax: {
        url: '/profiles/select_options'
      }
    }

    if (this.$element.data('with-ids')) {
      options['templateSelection'] = data => `${data.text} (#${data.id})`
    }

    return options
  }
}
