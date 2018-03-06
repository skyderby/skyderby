import { BaseController } from 'controllers/select2/base_controller'

export default class extends BaseController {
  options() {
    var options = {
      placeholder: $(this.element).attr('placeholder'),
      ajax: {
        url: '/tracks/select_options',
      }
    }

    const profile_id = $(this.element).data('profile-id')
    if (profile_id) {
      options.ajax['data'] = (params) => {
            return { query: params.term,
                     page: params.page,
                     profile_id: profile_id }
      }
    }

    return options
  }
}
