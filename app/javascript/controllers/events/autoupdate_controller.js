import { Controller } from 'stimulus';

export default class extends Controller {
  static targets = [ 'indicator', 'link' ]

  connect() {
    const event_id = this.element.getAttribute('data-event-id')

    this.subscription = cable.subscriptions.create({
      channel: 'EventUpdatesChannel',
      event_id: event_id,
    }, {
      received: () => { this.on_receive_update() }
    })
  }

  trigger_state(e) {
    if (e.target !== this.element) return

    e.target.blur()
    this.element.classList.toggle('active')
  }

  on_receive_update() {
    if (!this.element.classList.contains('active')) return

    $.rails.fire(this.link, 'click')
  }

  update_start() {
    this.indicator.classList.add('fa-spin')
  }

  update_finish() {
    this.indicator.classList.remove('fa-spin')
  }

  get indicator() {
    return this.indicatorTarget
  }

  get link() {
    return this.linkTarget
  }
}
