const IDLE_TIMEOUT = 3000

const pending = []
let client = null
let loading = null

const enabled = () =>
  Boolean(
    document.querySelector('meta[name="amplitude-api-key"]')?.content &&
      document.querySelector('meta[name="current-user-id"]')?.content
  )

const load = () => {
  loading ||= import(/* webpackChunkName: "amplitude" */ './amplitudeClient').then(
    module => {
      client = module
      client.start()
      pending.splice(0).forEach(([event, properties]) => client.track(event, properties))
      return client
    }
  )
  return loading
}

const whenIdle = callback =>
  window.requestIdleCallback
    ? window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT })
    : setTimeout(callback, 0)

const scheduleStart = () => {
  if (!enabled()) return
  if (client) client.start()
  else whenIdle(load)
}

const track = (event, properties) => {
  if (!enabled()) return
  if (client) {
    client.track(event, properties)
    return
  }

  pending.push([event, properties])
  load()
}

scheduleStart()
document.addEventListener('turbo:load', scheduleStart)

export default { track }
