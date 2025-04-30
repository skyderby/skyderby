import { Controller } from 'stimulus'

export default class FlightProfilesController extends Controller {
  connect() {}

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
}
