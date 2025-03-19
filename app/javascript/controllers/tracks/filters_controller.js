import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  submit(e) {
    e.preventDefault()

    const urlParams = new URLSearchParams(window.location.search)
    const formData = new FormData(this.element)
    const fields = ['suit_id', 'place_id', 'profile_id']
    fields.forEach(key => urlParams.delete(key))

    for (const [key, value] of formData) {
      if (value) urlParams.set(key, value)
    }
    Turbo.visit(['/tracks', urlParams.toString()].filter(Boolean).join('?'))
  }
}
