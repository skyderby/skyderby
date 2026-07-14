import { Controller } from '@hotwired/stimulus'
import { get } from '@rails/request.js'
import { calculateFlightProfile, calculateTerrainClearance } from 'utils/flightProfiles'
import I18n from 'i18n'
import { fetchTrackPoints } from 'utils/tracks/trackData'
import FlightProfileChart from 'charts/FlightProfileChart'
import amplitude from 'utils/amplitude'

export default class FlightProfilesController extends Controller {
  static targets = [
    'tracksList',
    'profileHost',
    'terrainHost',
    'tagbar',
    'tagTemplate',
    'proCta',
    'proCtaCompareId',
    'proCtaPrefix',
    'proCtaLabel'
  ]

  static values = { jumpProfilesUrl: String }

  connect() {
    this.selectedTracks = new Set(this.getSelectedTracksFromUrl())
    this.straightLine = this.getUnrollFromUrl()
    this.pointsCache = new Map()
    this.tracksCache = new Map()

    this.collapseSidebarOnMobileWithSelection()
    this.updateProCta()

    this.chart = new FlightProfileChart({
      profileHost: this.profileHostTarget,
      terrainHost: this.terrainHostTarget,
      formatters: {
        profile: this.profileTooltip,
        clearance: this.clearanceTooltip,
        terrain: this.terrainTooltip
      },
      labels: {
        resetZoom: I18n.t('flight_profiles.reset_zoom'),
        zoomTo: meters =>
          I18n.t('flight_profiles.zoom_to_first', { distance: Math.round(meters) })
      }
    })

    this.resizeCharts = this.resizeCharts.bind(this)
    this.chart.resize()

    Array.from(this.selectedTracks)
      .reduce(
        (promise, trackId) => promise.then(() => this.displayTrack(trackId)),
        Promise.resolve()
      )
      .then(() => {
        const jumpLineId = this.getJumpLineIdFromUrl()
        if (jumpLineId) this.displayTerrainProfile(jumpLineId)
      })

    window.addEventListener('resize', this.resizeCharts, { passive: true })
  }

  disconnect() {
    window.removeEventListener('resize', this.resizeCharts)
    this.chart?.destroy()
  }

  collapseSidebarOnMobileWithSelection() {
    if (this.selectedTracks.size === 0) return
    if (!window.matchMedia('(max-width: 575.98px)').matches) return

    const sidebar = this.element.querySelector('.explorer-sidebar')
    sidebar?.classList.add('collapsed')
  }

  handleJumpLineSelection(event) {
    const jumpLineId = event.target.value
    const url = new URL(window.location.href)

    if (jumpLineId) {
      url.searchParams.set('jump_profile_id', jumpLineId)
      this.displayTerrainProfile(jumpLineId)
    } else {
      url.searchParams.delete('jump_profile_id')
      this.currentMeasurements = null
      this.chart.clearTerrain()
      this.updateTerrainClearance()
    }

    window.history.replaceState({}, '', url)
  }

  handleTrackClick(event) {
    event.preventDefault()
    const trackElement = event.target.closest('a')
    if (!trackElement) return
    const trackId = trackElement.dataset.id

    if (this.selectedTracks.has(trackId)) {
      this.removeTrack(trackId)
    } else {
      this.selectedTracks.add(trackId)
      trackElement.classList.add('active')
      this.displayTrack(trackId)
    }

    this.updateUrlWithSelectedTracks()
    this.updateProCta()
  }

  processTrackLinks(event) {
    for (let trackElement of event.target.children) {
      trackElement.dataset.turboPrefetch = false

      const trackId = trackElement.dataset.id
      if (this.selectedTracks.has(trackId)) {
        trackElement.classList.add('active')
      }
    }
  }

  getSelectedTracksFromUrl() {
    const url = new URL(window.location.href)
    return url.searchParams.getAll('track[]')
  }

  getJumpLineIdFromUrl() {
    const url = new URL(window.location.href)
    return url.searchParams.get('jump_profile_id')
  }

  getUnrollFromUrl() {
    const url = new URL(window.location.href)
    return url.searchParams.get('unroll') === 'true'
  }

  updateUrlWithSelectedTracks() {
    const url = new URL(window.location.href)
    url.searchParams.delete('track[]')

    this.selectedTracks.forEach(trackId => {
      url.searchParams.append('track[]', trackId)
    })

    window.history.replaceState({}, '', url)
  }

  resizeCharts() {
    this.chart?.resize()
  }

  async displayTrack(trackId) {
    const track = await this.fetchTrack(trackId)
    const { points } = await this.fetchPoints(trackId)
    const profile = calculateFlightProfile(points, this.straightLine)

    this.chart.setTrack(trackId, { name: `#${trackId} ${track.name}`, profile })
    this.addTrackToTagbar(track)
    this.displayTerrainClearance(trackId, points)
    this.maybeAutoSelectTerrain(track)
  }

  async maybeAutoSelectTerrain(track) {
    if (this.currentMeasurements) return
    if (this.getJumpLineIdFromUrl()) return
    if (this.selectedTracks.size !== 1) return
    if (!track.placeId || !this.jumpProfilesUrlValue) return

    const option = await this.fetchPlaceJumpProfile(track.placeId)
    if (!option) return
    if (this.currentMeasurements || this.selectedTracks.size !== 1) return

    this.selectJumpLine(option.id, option.name)
  }

  async fetchPlaceJumpProfile(placeId) {
    const response = await get(this.jumpProfilesUrlValue, {
      query: { place_id: placeId },
      responseKind: 'html'
    })
    if (!response.ok) return null

    const doc = new DOMParser().parseFromString(await response.html, 'text/html')
    const option = doc.querySelector('.hot-select-option')
    if (!option) return null

    return { id: option.dataset.value, name: option.textContent.trim() }
  }

  selectJumpLine(id, name) {
    const select = this.element.querySelector('select[name="jump_line_id"]')

    if (!select) {
      this.displayTerrainProfile(id)
      const url = new URL(window.location.href)
      url.searchParams.set('jump_profile_id', id)
      window.history.replaceState({}, '', url)
      return
    }

    if (!Array.from(select.options).some(option => option.value === String(id))) {
      select.add(new Option(name, id))
    }
    select.value = String(id)
    select.dispatchEvent(new Event('change', { bubbles: true }))
  }

  addTrackToTagbar(track) {
    const tag = this.tagTemplateTarget.content
      .querySelector('.filter-tag')
      .cloneNode(true)
    const tagbar = this.tagbarTarget

    tag.dataset.id = track.id
    tag.querySelector('.filter-tag-type').innerText = `${track.name} - #${track.id}`
    tagbar.appendChild(tag)
  }

  removeTag(event) {
    const tag = event.target.closest('.filter-tag')
    const trackId = tag.dataset.id
    this.removeTrack(trackId)
  }

  removeTrack(trackId) {
    this.selectedTracks.delete(trackId)
    this.updateUrlWithSelectedTracks()
    this.chart.removeTrack(trackId)
    this.pointsCache.delete(trackId)
    this.tracksCache.delete(trackId)

    this.tracksListTarget
      .querySelector(`[data-id="${trackId}"]`)
      ?.classList.remove('active')
    this.tagbarTarget.querySelector(`[data-id="${trackId}"]`)?.remove()
    this.updateProCta()
  }

  updateProCta() {
    if (!this.hasProCtaTarget) return

    const cta = this.proCtaTarget
    const ids = Array.from(this.selectedTracks)

    if (ids.length !== 1 && ids.length !== 2) {
      cta.hidden = true
      return
    }

    const isCompare = ids.length === 2

    if (this.hasProCtaPrefixTarget) {
      this.proCtaPrefixTarget.textContent = isCompare
        ? cta.dataset.comparePrefix
        : cta.dataset.viewPrefix
    }

    if (this.hasProCtaLabelTarget) {
      this.proCtaLabelTarget.textContent = isCompare
        ? cta.dataset.compareLabel
        : cta.dataset.viewLabel
    }

    if (cta.dataset.proCtaForm && this.hasProCtaCompareIdTarget) {
      cta.action = cta.dataset.proViewUrlTemplate.replace('__ID__', ids[0])
      this.proCtaCompareIdTarget.value = isCompare ? ids[1] : ''
    }

    cta.hidden = false
  }

  trackProCta() {
    const ids = Array.from(this.selectedTracks)

    amplitude.track('pro_view_cta_clicked', {
      source: 'flight_profiles',
      action: ids.length === 2 ? 'compare' : 'view',
      state: this.proCtaTarget.dataset.proCtaState,
      track_id: ids[0],
      compare_track_id: ids[1] || null
    })
  }

  fetchTrack(trackId) {
    if (this.tracksCache.has(trackId)) {
      return this.tracksCache.get(trackId)
    }

    return get(`/tracks/${trackId}`, { responseKind: 'json' })
      .then(response => response.json)
      .then(data => {
        this.tracksCache.set(trackId, data)
        return data
      })
  }

  fetchPoints(trackId) {
    if (this.pointsCache.has(trackId)) {
      return this.pointsCache.get(trackId)
    }

    return fetchTrackPoints(`/tracks/${trackId}/points`).then(data => {
      this.pointsCache.set(trackId, data)
      return data
    })
  }

  displayTerrainClearance(trackId, points) {
    if (!this.currentMeasurements) return

    const clearance = calculateTerrainClearance(
      points,
      this.currentMeasurements,
      this.straightLine
    )
    this.chart.setClearance(trackId, clearance)
  }

  displayTerrainProfile(jumpLineId) {
    return get(`/exit_measurements/${jumpLineId}`, { responseKind: 'json' })
      .then(response => response.json)
      .then(({ name, measurements }) => {
        this.currentMeasurements = measurements
        this.chart.setTerrain({ name, measurements })
      })
      .then(() => this.updateTerrainClearance())
  }

  async updateTerrainClearance() {
    for (const trackId of this.selectedTracks) {
      if (this.currentMeasurements) {
        const { points } = await this.fetchPoints(trackId)
        this.displayTerrainClearance(trackId, points)
      } else {
        this.chart.setClearance(trackId, null)
      }
    }
  }

  profileTooltip = (sample, track) => {
    const custom = sample.custom || {}
    return `
      <div class="fp-tooltip-row">
        <span class="fp-tooltip-name" style="color: var(${track.colorVar})">${track.name}</span>
        <span>↓${Math.round(sample.y)} ${I18n.t('units.m')}
          →${Math.round(sample.x)} ${I18n.t('units.m')}</span>
        <span><b>${I18n.t('flight_profiles.full_speed')}:</b>
          ${custom.fullSpeed} ${I18n.t('units.kmh')}</span>
        <span><b>${I18n.t('flight_profiles.ground_speed')}:</b>
          ${custom.hSpeed} ${I18n.t('units.kmh')}</span>
        <span><b>${I18n.t('flight_profiles.vertical_speed')}:</b>
          ${custom.vSpeed} ${I18n.t('units.kmh')}</span>
      </div>
    `
  }

  clearanceTooltip = (sample, track) => {
    const custom = sample.custom || {}
    return `
      <div class="fp-tooltip-row">
        <span class="fp-tooltip-name" style="color: var(${track.colorVar})">${track.name}</span>
        <span><b>${I18n.t('flight_profiles.distance_traveled')}:</b>
          ${Math.round(sample.x)} ${I18n.t('units.m')}</span>
        <span><b>${I18n.t('flight_profiles.distance_to_terrain')}:</b>
          ${custom.presentation} ${I18n.t('units.m')}</span>
      </div>
    `
  }

  terrainTooltip = (sample, terrain) => {
    return `
      <div class="fp-tooltip-row">
        <span class="fp-tooltip-name fp-tooltip-name--terrain">${terrain.name}</span>
        <span>↓${Math.round(sample.y)} ${I18n.t('units.m')}
          →${Math.round(sample.x)} ${I18n.t('units.m')}</span>
      </div>
    `
  }
}
