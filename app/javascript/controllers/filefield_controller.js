import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['file_field', 'text_field']

  change() {
    const label = this.file_field.value.replace(/\\/g, '/').replace(/.*\//, '')

    this.text_field.value = label
  }

  get text_field() {
    return this.text_fieldTarget
  }

  get file_field() {
    return this.file_fieldTarget
  }
}
