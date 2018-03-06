import { BaseController } from 'controllers/select2/base_controller'

export default class extends BaseController {
  options() {
    return {
      placeholder: $(this.element).attr('placeholder'),
      ajax: {
        url: '/events/select_options',
      }
    }
  }
}
