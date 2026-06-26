import { Controller } from '@hotwired/stimulus'
import debounce from 'lodash.debounce'

export default class ProfilePicker extends Controller {
  static targets = [
    'nameInput',
    'profileId',
    'aliasId',
    'dropdown',
    'frame',
    'countryEditable',
    'countryReadonly',
    'countryReadonlyValue'
  ]

  static values = {
    src: String,
    minChars: { type: Number, default: 3 }
  }

  connect() {
    this.search = debounce(this.search.bind(this), 300)
  }

  disconnect() {
    this.hideDropdown()
  }

  input() {
    this.clearSelection()
    this.search()
  }

  search() {
    const term = this.nameInputTarget.value.trim()

    if (term.length < this.minCharsValue) {
      this.hideDropdown()
      return
    }

    const url = new URL(this.srcValue, window.location.origin)
    url.searchParams.set('term', term)
    url.searchParams.set('frame_id', this.frameTarget.id)
    this.frameTarget.src = url.toString()
    this.showDropdown()
  }

  select(event) {
    const option = event.currentTarget

    this.nameInputTarget.value = option.dataset.name
    this.profileIdTarget.value = option.dataset.profileId
    this.aliasIdTarget.value = option.dataset.aliasId || ''
    this.applyReadonlyCountry(option.dataset.countryName)
    this.hideDropdown()
  }

  clearSelection() {
    this.profileIdTarget.value = ''
    this.aliasIdTarget.value = ''
    this.applyEditableCountry()
  }

  applyReadonlyCountry(name) {
    if (!this.hasCountryReadonlyTarget) return

    this.countryReadonlyValueTarget.textContent = name || ''
    this.countryReadonlyTarget.hidden = false
    if (this.hasCountryEditableTarget) this.countryEditableTarget.hidden = true
  }

  applyEditableCountry() {
    if (!this.hasCountryEditableTarget) return

    this.countryEditableTarget.hidden = false
    if (this.hasCountryReadonlyTarget) this.countryReadonlyTarget.hidden = true
  }

  showDropdown() {
    if (!this.dropdownTarget.matches(':popover-open')) this.dropdownTarget.showPopover()
  }

  hideDropdown() {
    if (this.dropdownTarget.matches(':popover-open')) this.dropdownTarget.hidePopover()
  }
}
