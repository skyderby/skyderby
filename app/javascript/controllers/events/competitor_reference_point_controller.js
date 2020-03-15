import { Controller } from 'stimulus'
import Rails from '@rails/ujs'

const CARET_ICON = '<i class="fa fa-fw fa-caret-down"></i>'
const ELLIPSIS_ICON = '<i class="fa fa-fw fa-ellipsis-h"></i>'
const BLANKSLATE = ELLIPSIS_ICON + CARET_ICON
const LOADING_SPINNER =
  '<i class="fa fa-fw fa-circle-notch fa-spin"></i><i class="fa fa-fw"></i>'

export default class extends Controller {
  static targets = ['reference_point']

  clear_reference_point(e) {
    e.preventDefault()

    this.show_loading_spinner()

    fetch(this.url, {
      method: 'delete',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': Rails.csrfToken()
      }
    })
      .then(response => {
        if (response.ok) {
          return response.blob()
        }

        throw new Error(`${response.status}: ${response.statusText}`)
      })
      .then(() => {
        this.reference_point.setAttribute('data-id', '')
        this.reference_point.innerHTML = BLANKSLATE
      })
      .catch(error => {
        document.dispatchEvent(
          new CustomEvent('action:error', {
            detail: error,
            bubbles: true,
            cancelable: true
          })
        )

        this.restore_reference_point()
      })
  }

  assign_reference_point(event) {
    event.preventDefault()

    const element = event.currentTarget
    const reference_point_id = element.getAttribute('data-reference-point-id')
    const reference_point_name = element.text

    this.show_loading_spinner()

    fetch(this.url, {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': Rails.csrfToken()
      },
      body: JSON.stringify({ reference_point_id: reference_point_id })
    })
      .then(response => {
        if (response.ok) {
          return response.blob()
        }

        throw new Error(`${response.status}: ${response.statusText}`)
      })
      .then(() => {
        this.reference_point.setAttribute('data-id', reference_point_id)
        this.reference_point.innerHTML = reference_point_name + CARET_ICON
      })
      .catch(error => {
        document.dispatchEvent(
          new CustomEvent('action:error', {
            detail: error,
            bubbles: true,
            cancelable: true
          })
        )

        this.restore_reference_point()
      })
  }

  show_loading_spinner() {
    this.reference_point.setAttribute('data-prev-html', this.reference_point.innerHTML)
    this.reference_point.innerHTML = LOADING_SPINNER
  }

  restore_reference_point() {
    this.reference_point.innerHTML = this.reference_point.getAttribute('data-prev-html')
  }

  show_dl(e) {
    e.preventDefault()

    if (this.reference_point_id === '') return

    const event = new CustomEvent('round-map-competitor-row:show-dl', {
      detail: {
        competitor_id: this.competitor_id,
        reference_point_id: this.reference_point_id
      },
      bubbles: true,
      cancelable: true
    })

    this.element.dispatchEvent(event)
  }

  get competitor_id() {
    return this.element.getAttribute('data-competitor-id')
  }

  get reference_point_id() {
    return this.reference_point.getAttribute('data-id') || ''
  }

  get url() {
    return this.element.getAttribute('data-url')
  }

  get reference_point() {
    return this.reference_pointTarget
  }
}
