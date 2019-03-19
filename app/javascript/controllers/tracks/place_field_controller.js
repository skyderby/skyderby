import DualTypeFieldController from './dual_type_field_controller'

export default class extends DualTypeFieldController {
  get selectModeLinkText() {
    return I18n.t('tracks.form.toggle_place_link')
  }

  get selectModeCaption() {
    return I18n.t('tracks.form.toggle_place_caption')
  }

  get textModeLinkText() {
    return I18n.t('tracks.form.toggle_place_link_select')
  }

  get textModeCaption() {
    return I18n.t('tracks.form.toggle_place_caption_select')
  }
}
