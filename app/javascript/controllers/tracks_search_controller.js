import { Controller } from 'stimulus'

export default class TracksSearchController extends Controller {
  connect() {
    this.params = ['year[]', 'profile_id[]', 'suit_id[]', 'place_id[]']
    this.form.requestSubmit()
  }

  handleFilterAdd(event) {
    const { type, value } = event.detail
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = type
    input.value = value
    this.element.appendChild(input)

    this.submitWithUrlUpdate()
  }

  handleFilterRemove(event) {
    const { type, value } = event.detail
    this.element.querySelector(`input[name="${type}"][value="${value}"]`)?.remove()

    this.submitWithUrlUpdate()
  }

  handleFilterClear() {
    this.element
      .querySelectorAll('input:not([name="kind"])')
      .forEach(element => element.remove())

    this.submitWithUrlUpdate()
  }

  submitWithUrlUpdate() {
    const url = new URL(window.location.href)
    this.form.requestSubmit()

    const formData = new FormData(this.form)

    Array.from(url.searchParams.keys()).forEach(key => {
      if (this.params.includes(key)) url.searchParams.delete(key)
    })

    for (const [key, value] of formData.entries()) {
      if (key === 'kind') continue
      url.searchParams.append(key, value)
    }

    window.history.replaceState({}, '', url)
  }

  get form() {
    return this.element.closest('form')
  }
}
