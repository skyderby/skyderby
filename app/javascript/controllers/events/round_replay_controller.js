import { Controller } from 'stimulus'
import { h, render } from 'preact'
import RoundReplay from 'components/RoundReplay'

export default class extends Controller {
  connect() {
    render(<RoundReplay />, this.element)
  }
}
