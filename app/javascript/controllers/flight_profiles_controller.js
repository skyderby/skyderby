import { Controller } from 'stimulus'

export default class FlightProfilesController extends Controller {
  connect() {
    this.selectedTracks = new Set(this.getSelectedTracksFromUrl())
  }

  disconnect() {}

  handleJumpLineSelection(event) {
    const jumpLineId = event.target.value
    const url = new URL(window.location.href)

    if (jumpLineId) {
      url.searchParams.set('jump_profile_id', jumpLineId)
    } else {
      url.searchParams.delete('jump_profile_id')
    }

    window.history.replaceState({}, '', url)
  }

  handleTrackClick(event) {
    event.preventDefault()
    const trackElement = event.target.closest('a')
    const trackId = trackElement.dataset.id

    if (this.selectedTracks.has(trackId)) {
      this.selectedTracks.delete(trackId)
      trackElement.classList.remove('active')
    } else {
      this.selectedTracks.add(trackId)
      trackElement.classList.add('active')
    }

    this.updateUrlWithSelectedTracks()
  }

  setActiveTracks(event) {
    for (let trackElement of event.target.children) {
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

  updateUrlWithSelectedTracks() {
    const url = new URL(window.location.href)
    url.searchParams.delete('track[]')

    this.selectedTracks.forEach(trackId => {
      url.searchParams.append('track[]', trackId)
    })

    window.history.replaceState({}, '', url)
  }
}
