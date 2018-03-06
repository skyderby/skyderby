import { BaseController } from 'controllers/select2/base_controller'

export default class extends BaseController {
  options() {
    return {
      placeholder: $(this.element).data('placeholder'),
      ajax: {
        url: '/users/select_options',
      }
    }
  }
}
