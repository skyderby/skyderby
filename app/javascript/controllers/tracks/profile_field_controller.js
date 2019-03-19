import DualTypeFieldController from './dual_type_field_controller'

export default class extends DualTypeFieldController {
  get selectModeLinkText() {
    return I18n.t('tracks.form.toggle_profile_link')
  }

  get selectModeCaption() {
    return I18n.t('tracks.form.toggle_profile_caption')
  }

  get textModeLinkText() {
    return I18n.t('tracks.form.toggle_profile_link_select')
  }

  get textModeCaption() {
    return I18n.t('tracks.form.toggle_profile_caption_select')
  }
}
