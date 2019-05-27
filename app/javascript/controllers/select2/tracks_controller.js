import { BaseController } from 'controllers/select2/base_controller'

export default class extends BaseController {
  get options() {
    var options = {
      ajax: {
        url: '/tracks/select_options'
      }
    }

    if (this.profileId) {
      options.ajax['data'] = params => ({
        query: params.term,
        page: params.page,
        profile_id: this.profileId
      })
    }

    return options
  }

  get profileId() {
    return this.element.getAttribute('data-profile-id')
  }
}
