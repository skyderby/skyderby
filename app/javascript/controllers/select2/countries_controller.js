import { BaseController } from 'controllers/select2/base_controller'

export default class extends BaseController {
  get options() {
    return {
      ajax: {
        url: '/countries/select_options'
      }
    }
  }
}
