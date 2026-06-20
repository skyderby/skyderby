import { Controller } from '@hotwired/stimulus'

export default class TracksSearchController extends Controller {
  static values = { storageKey: String }

  connect() {
    this.params = ['year[]', 'profile_id[]', 'suit_id[]', 'place_id[]']
    this.restoreFilters()
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
    this.persistFilters()
  }

  handleFilterRemove(event) {
    const { type, value } = event.detail
    this.element.querySelector(`input[name="${type}"][value="${value}"]`)?.remove()

    this.submitWithUrlUpdate()
    this.persistFilters()
  }

  handleFilterClear() {
    this.element
      .querySelectorAll(
        'input:not([name="kind"]):not([name="infinite"]):not([name="exclude_id"])'
      )
      .forEach(element => element.remove())

    this.submitWithUrlUpdate()
    this.clearPersistedFilters()
  }

  restoreFilters() {
    if (!this.hasStorageKeyValue) return

    const tagsContainer = this.element.querySelector('.selected-tags-container')
    if (!tagsContainer || tagsContainer.children.length > 0) return

    this.readPersistedFilters().forEach(({ param, value, label, name }) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = param
      input.value = value
      this.element.appendChild(input)

      tagsContainer.appendChild(this.buildTag(param, value, label, name))
    })
  }

  persistFilters() {
    if (!this.hasStorageKeyValue) return

    const tags = Array.from(
      this.element.querySelectorAll('.selected-tags-container .filter-tag')
    ).map(tag => ({
      param: tag.dataset.type,
      value: tag.dataset.value,
      label: tag.querySelector('.filter-tag-type').textContent,
      name: tag.querySelector('.filter-tag-value').textContent
    }))

    localStorage.setItem(this.storageKeyValue, JSON.stringify(tags))
  }

  clearPersistedFilters() {
    if (!this.hasStorageKeyValue) return

    localStorage.removeItem(this.storageKeyValue)
  }

  readPersistedFilters() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeyValue) || '[]')
    } catch {
      return []
    }
  }

  buildTag(param, value, label, name) {
    const template = this.element.querySelector('[data-omni-search-target="tagTemplate"]')
    const tag = template.content.querySelector('.filter-tag').cloneNode(true)
    tag.dataset.type = param
    tag.dataset.value = value
    tag.querySelector('.filter-tag-type').textContent = label
    tag.querySelector('.filter-tag-value').textContent = name
    return tag
  }

  submitWithUrlUpdate() {
    const url = new URL(window.location.href)
    this.form.requestSubmit()

    const formData = new FormData(this.form)

    Array.from(url.searchParams.keys()).forEach(key => {
      if (this.params.includes(key)) url.searchParams.delete(key)
    })

    for (const [key, value] of formData.entries()) {
      if (key === 'kind' || key === 'infinite' || key === 'exclude_id') continue
      url.searchParams.append(key, value)
    }

    window.history.replaceState({}, '', url)
  }

  get form() {
    return this.element.closest('form')
  }
}
