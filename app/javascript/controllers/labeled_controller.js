import { Controller } from '@hotwired/stimulus'
import Labels from 'utils/labels'

export default class extends Controller {
  static values = { labels: Object }

  get labels() {
    this._labels ||= new Labels(this.labelsValue)
    return this._labels
  }
}
