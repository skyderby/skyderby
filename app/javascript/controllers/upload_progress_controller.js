import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = [ 'spinner', 'done', 'comment' ]

  connect() {
    let form = this.element.closest('form')

    form.addEventListener('ajax:before',     this.on_start)
    form.addEventListener('ajax:beforeSend', this.on_before_send)
    form.addEventListener('ajax:success',    this.on_success)
    form.addEventListener('ajax:error',      this.on_error)

    this.default_comment = this.comment.innerHTML
  }

  on_start = (event) => {
    this.element.style.display = ''
  }

  on_before_send = (event) => {
    let [xhr, options] = event.detail
    xhr.upload.onprogress = this.on_progress
  }

  on_success = (event) => {
    this.spinner.style.display = 'none'
    this.done.style.display = ''
    this.comment.textContent = 'Done! Final preparations...'
  }

  on_error = (event) => {
    this.element.style.display = 'none'
    this.comment.innerHTML = this.default_comment
  }

  on_progress = (event) => {
    let percents = Math.round(event.loaded / event.total * 100)
    this.comment.querySelector('.progress-count').textContent = `${percents} %`
    if (percents == 100) {
      this.comment.textContent = 'Processing track...'
    }
  }

  get spinner() {
    return this.spinnerTarget
  }

  get done() {
    return this.doneTarget
  }

  get comment() {
    return this.commentTarget
  }
}
