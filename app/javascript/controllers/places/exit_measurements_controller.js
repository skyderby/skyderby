import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['container', 'template', 'textarea']

  connect() {
    this.currentIndex = new Date().getTime()
  }

  add(e) {
    e.preventDefault()
    this.addRow()
  }

  remove(e) {
    e.preventDefault()
    this.removeRow(e.currentTarget.closest('tr'))
  }

  addRow() {
    const template = this.template.split('__M_INDEX__').join(this.newChildIndex)
    this.containerTarget.insertAdjacentHTML('beforeend', template)

    return this.containerTarget.querySelector('tr:last-child')
  }

  removeRow(tr) {
    tr.querySelector('input[name$="[_destroy]"]').value = true
    tr.style.display = 'none'
  }

  removeAll() {
    this.containerTarget.querySelectorAll('tr').forEach(tr => this.removeRow(tr))
  }

  addFromText(e) {
    e.preventDefault()
    const rows = this.textareaTarget.value.split('\n')

    if (rows.length === 0) return

    this.removeAll()
    rows.forEach(rowData => {
      const row = this.addRow()
      const [altitude, distance] = rowData.trim().split(' ').slice(-2)
      row.querySelector('input[name$="[altitude]"]').value = altitude
      row.querySelector('input[name$="[distance]"]').value = distance
    })
  }

  get newChildIndex() {
    this.currentIndex += 1
    return this.currentIndex
  }

  get template() {
    return this.templateTarget.innerHTML
  }
}
