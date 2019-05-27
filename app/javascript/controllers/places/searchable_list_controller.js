import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['place', 'country']

  filter_places(event) {
    const term = event.target.value

    if (term === '') {
      this.show_countries()
      this.show_all_places()
      return
    }

    this.hide_countries()

    if (this.timer_id) clearTimeout(this.timer_id)
    this.timer_id = setTimeout(() => this.filter_places_by_term(term), 100)
  }

  show_countries() {
    this.countryTargets.forEach(el => (el.style.display = 'block'))
  }

  hide_countries() {
    this.countryTargets.forEach(el => (el.style.display = 'none'))
  }

  show_all_places() {
    this.placeTargets.forEach(el => (el.style.display = 'block'))
  }

  filter_places_by_term(term) {
    this.placeTargets.forEach(el => {
      el.style.display =
        el.innerText.toLowerCase().indexOf(term.toLowerCase()) === -1 ? 'none' : 'block'
    })
  }
}
