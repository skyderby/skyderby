import { Controller } from 'stimulus'

export default class extends Controller {
  perform() {
    let timer_id = this.data.get('timer-id')
    if (timer_id) clearTimeout(timer_id)

    const element = this.element.querySelector('input[name="search"]')

    this.data.set('timer_id', setTimeout(function() {
      $.rails.fire(element, 'change');
      timer_id = undefined;
    }, 200));
  }
}
