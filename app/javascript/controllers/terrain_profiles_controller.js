import { Controller } from '@hotwired/stimulus'
import { get } from '@rails/request.js'
import I18n from 'i18n'
import FlightProfileChart from 'charts/FlightProfileChart'
import { withExitPoint } from 'utils/terrainProfiles'

export default class TerrainProfilesController extends Controller {
  static targets = [
    'item',
    'scope',
    'scopeButton',
    'search',
    'chartHost',
    'tagbar',
    'tagTemplate'
  ]

  static values = { measurementsUrlTemplate: String }

  connect() {
    this.selected = new Set(this.selectionFromUrl())
    this.measurementsCache = new Map()

    this.chart = new FlightProfileChart({
      profileHost: this.chartHostTarget,
      formatters: { profile: this.profileTooltip },
      labels: {
        resetZoom: I18n.t('flight_profiles.reset_zoom'),
        zoomTo: meters =>
          I18n.t('flight_profiles.zoom_to_first', { distance: Math.round(meters) })
      }
    })

    this.resizeChart = this.resizeChart.bind(this)
    window.addEventListener('resize', this.resizeChart, { passive: true })

    Array.from(this.selected).reduce(
      (promise, id) => promise.then(() => this.displayProfile(id)),
      Promise.resolve()
    )

    this.markSelectedItems()
    this.activateScopeWithSelection()
    this.chart.resize()
  }

  disconnect() {
    window.removeEventListener('resize', this.resizeChart)
    this.chart?.destroy()
  }

  resizeChart() {
    this.chart?.resize()
  }

  switchScope(event) {
    this.activateScope(event.currentTarget.dataset.scope)
  }

  activateScope(scope) {
    this.scopeButtonTargets.forEach(button =>
      button.classList.toggle('active', button.dataset.scope === scope)
    )
    this.scopeTargets.forEach(list =>
      list.classList.toggle('hide', list.dataset.scope !== scope)
    )

    this.filter()
  }

  activateScopeWithSelection() {
    if (this.selected.size === 0 || this.scopeTargets.length < 2) return

    const active = this.scopeTargets.find(list => !list.classList.contains('hide'))
    if (active && this.listsSelection(active)) return

    const fallback = this.scopeTargets.find(list => this.listsSelection(list))
    if (fallback) this.activateScope(fallback.dataset.scope)
  }

  listsSelection(list) {
    return Array.from(this.selected).some(id => list.querySelector(`[data-id="${id}"]`))
  }

  filter() {
    const term = this.hasSearchTarget ? this.searchTarget.value.trim().toLowerCase() : ''

    this.itemTargets.forEach(item => {
      const matches = term === '' || item.dataset.name.toLowerCase().includes(term)
      item.classList.toggle('hide', !matches)
    })
  }

  toggle(event) {
    event.preventDefault()

    const item = event.target.closest('.explorer-list-item')
    if (!item) return

    const id = item.dataset.id

    if (this.selected.has(id)) {
      this.removeProfile(id)
    } else {
      this.selected.add(id)
      this.markSelectedItems()
      this.displayProfile(id)
    }

    this.updateUrl()
  }

  removeTag(event) {
    const tag = event.target.closest('.filter-tag')
    this.removeProfile(tag.dataset.id)
    this.updateUrl()
  }

  removeProfile(id) {
    this.selected.delete(id)
    this.chart.removeTrack(id)
    this.tagbarTarget.querySelector(`.filter-tag[data-id="${id}"]`)?.remove()
    this.markSelectedItems()
  }

  async displayProfile(id) {
    const { name, measurements } = await this.fetchMeasurements(id)
    const profile = withExitPoint(
      measurements
        .map(({ distance, altitude }) => ({ x: distance, y: altitude }))
        .sort((a, b) => a.x - b.x)
    )

    this.chart.setTrack(id, { name, profile })
    this.addTag(id, name)
  }

  fetchMeasurements(id) {
    if (this.measurementsCache.has(id)) return this.measurementsCache.get(id)

    const request = get(this.measurementsUrlTemplateValue.replace('__ID__', id), {
      responseKind: 'json'
    }).then(response => response.json)

    this.measurementsCache.set(id, request)

    return request
  }

  addTag(id, name) {
    if (this.tagbarTarget.querySelector(`.filter-tag[data-id="${id}"]`)) return

    const tag = this.tagTemplateTarget.content
      .querySelector('.filter-tag')
      .cloneNode(true)

    tag.dataset.id = id
    tag.querySelector('.filter-tag-type').innerText = name
    tag.style.setProperty('--tag-color', `var(${this.chart.colorVarFor(id)})`)
    this.tagbarTarget.appendChild(tag)
  }

  markSelectedItems() {
    this.itemTargets.forEach(item =>
      item.classList.toggle('active', this.selected.has(item.dataset.id))
    )
  }

  selectionFromUrl() {
    return new URL(window.location.href).searchParams.getAll('profile[]')
  }

  updateUrl() {
    const url = new URL(window.location.href)
    url.searchParams.delete('profile[]')
    this.selected.forEach(id => url.searchParams.append('profile[]', id))
    window.history.replaceState({}, '', url)
  }

  profileTooltip = (sample, profile) => `
    <div class="fp-tooltip-row">
      <span class="fp-tooltip-name" style="color: var(${profile.colorVar})">
        ${profile.name}
      </span>
      <span>↑${Math.round(sample.y)} ${I18n.t('units.m')}
        →${Math.round(sample.x)} ${I18n.t('units.m')}</span>
    </div>
  `
}
