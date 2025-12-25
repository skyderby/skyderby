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
    initialized = true
  }

  amplitude.setUserId(userId)

  amplitude.track('Page View', {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title
  })

  identifyUser()
}

initializeAmplitude()

document.addEventListener('turbo:load', initializeAmplitude)

export default amplitude
