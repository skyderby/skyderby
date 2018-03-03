import { BaseController } from 'controllers/select2/base_controller'

export default class extends BaseController {
  options() {
    var options = {
      placeholder: $(this.element).attr('placeholder'),
      ajax: {
        url: '/profiles/select_options',
      }
    }

    if ($(this.element).data('with-ids')) {
      options['templateSelection'] = (data) => {
        return data.text + ' (#' + data.id + ')';
      }
    }

    return options
  }
}
