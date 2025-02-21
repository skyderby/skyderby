import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['place', 'country']

  filterPlaces(event) {
    const term = event.target.value

    if (term === '') {
      this.showCountries()
      this.showAllPlaces()
      return
    }

    this.filterPlacesByTerm(term)
    this.hideEmptyCountries()
  }

  showCountries() {
    this.countryTargets.forEach(el => (el.style.display = 'block'))
  }

  hideEmptyCountries() {
    this.countryTargets.forEach(country => {
      const places = country.querySelectorAll('.places__item')
      const allHidden = Array.from(places).every(place => place.style.display === 'none')
      country.style.display = allHidden ? 'none' : 'block'
    })
  }

  showAllPlaces() {
    this.placeTargets.forEach(el => (el.style.display = 'block'))
  }

  filterPlacesByTerm(term) {
    this.placeTargets.forEach(el => {
      el.style.display =
        el.innerText.toLowerCase().indexOf(term.toLowerCase()) === -1 ? 'none' : 'block'
    })
  }
}
