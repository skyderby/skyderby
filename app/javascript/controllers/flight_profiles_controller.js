import LabeledController from 'controllers/labeled_controller'
import { get, post } from '@rails/request.js'
import { calculateFlightProfile, calculateTerrainClearance } from 'utils/flightProfiles'
import { fetchTrackPoints } from 'utils/tracks/trackData'
import FlightProfileChart from 'charts/FlightProfileChart'
import amplitude from 'utils/amplitude'
import { accelerationHtml } from 'charts/svg/format'
import { cloneTemplate, escapeHtml, fillSlots, slot } from 'utils/templates'
import {
  layoutLabels,
  playbackStateAt,
  profileDuration
} from 'utils/flightProfilePlayback'

const round = value => String(Math.round(value))

export default class FlightProfilesController extends LabeledController {
  static targets = [
    'tracksList',
    'profileHost',
    'terrainHost',
    'tagbar',
    'tagTemplate',
    'proCta',
    'proCtaCompareId',
    'proCtaPrefix',
    'proCtaLabel',
    'playback',
    'playButton',
    'slider',
    'clock',
    'playbackMeta',
    'playbackPrompt',
    'playbackPromptTitle',
    'labelTemplate'
  ]

  static values = {
    terrainProfilesUrl: String,
    measurementsUrlTemplate: String,
    playbackUrl: String
  }

  connect() {
    this.selectedTracks = new Set(this.getSelectedTracksFromUrl())
    this.straightLine = this.getUnrollFromUrl()
    this.pointsCache = new Map()
    this.tracksCache = new Map()

    this.profiles = new Map()
    this.playerTime = 0
    this.loadQuota()

    this.collapseSidebarOnMobileWithSelection()
    this.updateProCta()

    this.chart = new FlightProfileChart({
      profileHost: this.profileHostTarget,
      terrainHost: this.terrainHostTarget,
      onRender: () => this.renderPlaybackLabels(),
      formatters: {
        profile: this.profileTooltip,
        clearance: this.clearanceTooltip,
        terrain: this.terrainTooltip
      },
      labels: {
        zoomAll: this.labels.t('flight_profiles.zoom_all'),
        preset: meters => `${meters} ${this.labels.t('units.m')}`,
        zoomTo: meters =>
          this.labels.t('flight_profiles.zoom_to_first', { distance: Math.round(meters) })
      }
    })

    this.resizeCharts = this.resizeCharts.bind(this)
    this.chart.resize()
    this.updatePlaybackControls()

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
    this.pause()
    this.labelsLayer?.remove()
    this.labelsLayer = null
    this.labelElements = null
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
    this.resetPlayback()
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

    if (!this.selectedTracks.has(trackId)) return

    this.profiles.set(trackId, profile)
    this.chart.setTrack(trackId, { name: `#${trackId} ${track.name}`, profile })
    this.updatePlaybackControls()
    this.addTrackToTagbar(track)
    this.displayTerrainClearance(trackId, points)
    this.maybeAutoSelectTerrain(track)
  }

  async maybeAutoSelectTerrain(track) {
    if (this.currentMeasurements) return
    if (this.getJumpLineIdFromUrl()) return
    if (this.selectedTracks.size !== 1) return
    if (!track.placeId || !this.terrainProfilesUrlValue) return

    const option = await this.fetchPlaceTerrainProfile(track.placeId)
    if (!option) return
    if (this.currentMeasurements || this.selectedTracks.size !== 1) return

    this.selectJumpLine(option.id, option.name)
  }

  async fetchPlaceTerrainProfile(placeId) {
    const response = await get(this.terrainProfilesUrlValue, {
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
    this.profiles.delete(trackId)
    this.labelElements?.get(trackId)?.remove()
    this.labelElements?.delete(trackId)

    this.tracksListTarget
      .querySelector(`[data-id="${trackId}"]`)
      ?.classList.remove('active')
    this.tagbarTarget.querySelector(`[data-id="${trackId}"]`)?.remove()
    this.updateProCta()
    this.resetPlayback()
  }

  updateProCta() {
    if (!this.hasProCtaTarget) return

    const cta = this.proCtaTarget
    const ids = Array.from(this.selectedTracks)

    if (this.replayUsed || (ids.length !== 1 && ids.length !== 2)) {
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

  loadQuota() {
    if (!this.hasPlaybackTarget) return

    const { quotaState, quotaLimit, quotaRemaining, quotaTrackIds } =
      this.playbackTarget.dataset
    this.quota = {
      state: quotaState,
      limit: Number(quotaLimit),
      remaining: Number(quotaRemaining),
      trackIds: new Set(JSON.parse(quotaTrackIds || '[]').map(String))
    }
  }

  get playbackTrackIds() {
    return Array.from(this.selectedTracks).filter(id => this.profiles.has(id))
  }

  get playbackDuration() {
    return Math.max(
      0,
      ...this.playbackTrackIds.map(id => profileDuration(this.profiles.get(id)))
    )
  }

  playbackAllowed(ids) {
    if (!this.quota) return false
    if (this.quota.state === 'pro') return true
    if (this.quota.state === 'guest') return false
    return ids.every(id => this.quota.trackIds.has(id))
  }

  updatePlaybackControls() {
    if (!this.hasPlayButtonTarget) return

    const ids = this.playbackTrackIds
    this.playButtonTarget.disabled = ids.length === 0 || this.quota?.state === 'guest'
    this.sliderTarget.disabled = ids.length === 0 || !this.playbackAllowed(ids)

    if (this.hasPlaybackMetaTarget) {
      this.playbackMetaTarget.textContent =
        this.quota?.state === 'free'
          ? this.labels.t('flight_profiles.playback.remaining', {
              count: this.quota.remaining,
              limit: this.quota.limit
            })
          : ''
    }
  }

  resetPlayback() {
    this.pause()
    this.hidePlaybackPrompt()
    this.playerTime = 0
    this.playbackPositions = []
    this.chart?.setPlayback([])
    this.renderPlaybackLabels()
    if (this.hasSliderTarget) this.sliderTarget.value = 0
    this.updateClock()
    this.updatePlaybackControls()
  }

  async togglePlay() {
    if (this.animationFrame) {
      this.pause()
      return
    }
    if (this.requestingPlayback) return

    const ids = this.playbackTrackIds
    if (!ids.length) return

    this.requestingPlayback = true
    try {
      if (!(await this.ensurePlaybackAllowed(ids))) return
    } finally {
      this.requestingPlayback = false
    }
    const playable = this.playbackTrackIds
    if (!this.playbackAllowed(playable)) return

    const duration = this.playbackDuration
    if (this.playerTime >= duration) this.playerTime = 0
    if (this.playerTime === 0)
      this.trackPlaybackEvent('flight_profiles_playback_started', playable)

    this.replayUsed = true
    this.updateProCta()

    this.lastFrame = performance.now()
    this.playButtonTarget.classList.add('playing')
    this.animationFrame = requestAnimationFrame(this.animate)
  }

  async ensurePlaybackAllowed(ids) {
    if (this.playbackAllowed(ids)) return true

    if (this.quota?.state === 'guest') return false

    const response = await post(this.playbackUrlValue, {
      body: { track_ids: ids },
      responseKind: 'json'
    })
    if (!response.ok && response.statusCode !== 401) return false

    const body = await response.json

    if (body.status === 'sign_in_required') {
      this.quota.state = 'guest'
      this.updatePlaybackControls()
      return false
    }

    this.quota.remaining = body.remaining
    this.quota.trackIds = new Set((body.track_ids || []).map(String))
    if (body.unlimited) this.quota.state = 'pro'
    this.updatePlaybackControls()

    if (body.status === 'limit_reached') {
      this.updatePlaybackPromptTitle()
      this.showPlaybackPrompt()
      this.trackPlaybackEvent('flight_profiles_playback_quota_exhausted', ids)
      return false
    }

    return true
  }

  showPlaybackPrompt() {
    if (this.hasPlaybackPromptTarget) this.playbackPromptTarget.hidden = false
  }

  updatePlaybackPromptTitle() {
    if (!this.hasPlaybackPromptTitleTarget) return

    const { remaining, limit } = this.quota
    this.playbackPromptTitleTarget.textContent = remaining
      ? this.labels.t('flight_profiles.playback.limit_partial_title', {
          count: remaining
        })
      : this.labels.t('flight_profiles.playback.limit_reached_title', { limit })
  }

  hidePlaybackPrompt() {
    if (this.hasPlaybackPromptTarget) this.playbackPromptTarget.hidden = true
  }

  trackPlaybackEvent(event, ids) {
    amplitude.track(event, {
      track_count: ids.length,
      track_ids: ids,
      state: this.quota?.state,
      remaining: this.quota?.state === 'free' ? this.quota.remaining : null
    })
  }

  trackPlaybackCta() {
    amplitude.track('flight_profiles_playback_cta_clicked', {
      state: this.quota?.state,
      track_count: this.playbackTrackIds.length
    })
  }

  pause() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
    this.animationFrame = null
    if (this.hasPlayButtonTarget) this.playButtonTarget.classList.remove('playing')
  }

  animate = now => {
    const duration = this.playbackDuration
    const time = Math.min(this.playerTime + (now - this.lastFrame) / 1000, duration)
    this.lastFrame = now
    this.showTime(time)

    if (time >= duration) {
      this.pause()
    } else {
      this.animationFrame = requestAnimationFrame(this.animate)
    }
  }

  seek() {
    const ids = this.playbackTrackIds
    if (!ids.length || !this.playbackAllowed(ids)) return

    this.lastFrame = performance.now()
    this.showTime(
      (this.sliderTarget.value / this.sliderTarget.max) * this.playbackDuration
    )
  }

  showTime(time) {
    const duration = this.playbackDuration
    this.playerTime = time
    this.playbackPositions =
      time < duration
        ? this.playbackTrackIds.flatMap(id => {
            if (!this.playbackAllowed([id])) return []
            const state = playbackStateAt(this.profiles.get(id), time)
            return state ? [{ id, ...state }] : []
          })
        : []

    this.chart.setPlayback(this.playbackPositions)
    this.renderPlaybackLabels()
    this.sliderTarget.value = duration
      ? Math.round((time / duration) * this.sliderTarget.max)
      : 0
    this.updateClock()
  }

  updateClock() {
    if (!this.hasClockTarget) return
    this.clockTarget.textContent = `${this.playerTime.toFixed(1)} ${this.labels.t('flight_profiles.playback.seconds')}`
  }

  renderPlaybackLabels() {
    if (!this.hasLabelTemplateTarget || !this.chart) return

    this.labelsLayer ||= this.buildLabelsLayer()
    this.labelElements ||= new Map()
    const { width, height } = this.chart
    const positions = (this.playbackPositions || []).filter(position => {
      const px = this.chart.x(position.x)
      const py = this.chart.yProfile(position.y)
      return px >= 0 && px <= width && py >= 0 && py <= height
    })
    const visible = new Set(positions.map(position => position.id))
    this.labelElements.forEach((element, id) => {
      element.hidden = !visible.has(id)
    })
    if (!positions.length) return

    const meters = value => `${Math.round(value)} ${this.labels.t('units.m')}`
    const elements = positions.map(position => {
      const element = this.labelElement(position.id)
      const { acceleration } = position
      fillSlots(element, {
        name: this.chart.tracks.get(position.id)?.name,
        drop: meters(position.y),
        distance: meters(position.x),
        fullSpeed: round(position.fullSpeed),
        vSpeed: round(position.vSpeed),
        hSpeed: round(position.hSpeed)
      })
      slot(element, 'fullAccel').innerHTML = accelerationHtml(
        acceleration?.fullSpeedAccel
      )
      slot(element, 'vAccel').innerHTML = accelerationHtml(acceleration?.vSpeedAccel)
      slot(element, 'hAccel').innerHTML = accelerationHtml(acceleration?.hSpeedAccel)
      return element
    })

    const items = positions.map((position, index) => ({
      element: elements[index],
      px: this.chart.x(position.x),
      py: this.chart.yProfile(position.y),
      width: elements[index].offsetWidth,
      height: elements[index].offsetHeight
    }))

    layoutLabels(items, width, height)
    items.forEach(({ element, left, top }) => {
      element.style.left = `${Math.round(left)}px`
      element.style.top = `${Math.round(top)}px`
    })
  }

  buildLabelsLayer() {
    const layer = document.createElement('div')
    layer.className = 'fp-replay-labels'
    this.profileHostTarget.appendChild(layer)
    return layer
  }

  labelElement(id) {
    let element = this.labelElements.get(id)
    if (!element) {
      element = cloneTemplate(this.labelTemplateTarget)
      element.style.setProperty('--fp-label-color', `var(${this.chart.colorVarFor(id)})`)
      this.labelsLayer.appendChild(element)
      this.labelElements.set(id, element)
    }
    element.hidden = false
    return element
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
    return get(this.measurementsUrlTemplateValue.replace('__ID__', jumpLineId), {
      responseKind: 'json'
    })
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
    const meters = this.labels.t('units.m')
    const state = playbackStateAt(track.profile, sample.custom?.time ?? 0)
    const speeds = state || { ...sample.custom, acceleration: null }

    return `
      <div class="fp-tooltip-row">
        <span class="fp-tooltip-name" style="color: var(${track.colorVar})">${escapeHtml(track.name)}</span>
        <span>↓${Math.round(sample.y)} ${meters}
          →${Math.round(sample.x)} ${meters}</span>
        <span><b>${this.labels.t('flight_profiles.playback.time_from_exit')}:</b>
          ${(sample.custom?.time ?? 0).toFixed(1)} ${this.labels.t('flight_profiles.playback.seconds')}</span>
        ${this.speedLineHtml(speeds)}
      </div>
    `
  }

  speedLineHtml({ fullSpeed, vSpeed, hSpeed, acceleration }) {
    return `
      <span class="fp-speed-line">
        <b>${this.labels.t('flight_profiles.playback.speed_label')}, ${this.labels.t('units.kmh')}</b>
        <span class="fp-speed-value fp-speed-value--full">${round(fullSpeed)}</span>${accelerationHtml(acceleration?.fullSpeedAccel)}
        <span class="fp-replay-label__divider">|</span>
        <span class="fp-speed-value--vertical">↓</span>
        <span class="fp-speed-value fp-speed-value--vertical">${round(vSpeed)}</span>${accelerationHtml(acceleration?.vSpeedAccel)}
        <span class="fp-replay-label__spacer fp-speed-value--horizontal">→</span>
        <span class="fp-speed-value fp-speed-value--horizontal">${round(hSpeed)}</span>${accelerationHtml(acceleration?.hSpeedAccel)}
      </span>
    `
  }

  clearanceTooltip = (sample, track) => {
    const custom = sample.custom || {}
    return `
      <div class="fp-tooltip-row">
        <span class="fp-tooltip-name" style="color: var(${track.colorVar})">${escapeHtml(track.name)}</span>
        <span><b>${this.labels.t('flight_profiles.distance_traveled')}:</b>
          ${Math.round(sample.x)} ${this.labels.t('units.m')}</span>
        <span><b>${this.labels.t('flight_profiles.distance_to_terrain')}:</b>
          ${custom.presentation} ${this.labels.t('units.m')}</span>
      </div>
    `
  }

  terrainTooltip = (sample, terrain) => {
    return `
      <div class="fp-tooltip-row">
        <span class="fp-tooltip-name fp-tooltip-name--terrain">${escapeHtml(terrain.name)}</span>
        <span>↓${Math.round(sample.y)} ${this.labels.t('units.m')}
          →${Math.round(sample.x)} ${this.labels.t('units.m')}</span>
      </div>
    `
  }
}
