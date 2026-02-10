import * as amplitude from '@amplitude/analytics-browser'
import * as sessionReplay from '@amplitude/plugin-session-replay-browser'

const apiKey = document.querySelector('meta[name="amplitude-api-key"]')?.content

let initialized = false

const getUserId = () => {
  const meta = document.querySelector('meta[name="current-user-id"]')
  return meta?.content || undefined
}

const getUserName = () => {
  const meta = document.querySelector('meta[name="current-user-name"]')
  return meta?.content || undefined
}

const identifyUser = () => {
  const userName = getUserName()
  if (!userName) return

  const identifyEvent = new amplitude.Identify()
  identifyEvent.set('name', userName)
  amplitude.identify(identifyEvent)
}

const trackPageEnrichmentPlugin = () => ({
  name: 'track-page-enrichment',
  type: 'enrichment',
  setup: async () => undefined,
  execute: async event => {
    if (!window.location.pathname.startsWith('/tracks/')) return event

    const trackKind = document.querySelector('meta[name="track-kind"]')?.content
    const proView = document.querySelector('meta[name="track-pro-view"]')

    if (trackKind) {
      event.event_properties = {
        ...event.event_properties,
        track_kind: trackKind,
        track_pro_view: proView?.content === 'true'
      }
    }

    return event
  }
})

const initializeAmplitude = () => {
  if (!apiKey) return

  const userId = getUserId()
  if (!userId) return

  if (!initialized) {
    const options = {
      minIdLength: 1,
      defaultTracking: true
    }

    amplitude.init(apiKey, userId, options)
    amplitude.add(sessionReplay.plugin({ sampleRate: 1 }))
    amplitude.add(trackPageEnrichmentPlugin())
    initialized = true
  }

  amplitude.setUserId(userId)

  identifyUser()
}

initializeAmplitude()

document.addEventListener('turbo:load', initializeAmplitude)

export default amplitude
