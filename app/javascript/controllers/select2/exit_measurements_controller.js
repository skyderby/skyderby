import { BaseController } from 'controllers/select2/base_controller'

export default class extends BaseController {
  get options() {
    return {
      ajax: {
        url: '/api/v1/places/exit_measurements'
      }
    }
  }
}
