import * as amplitude from '@amplitude/analytics-browser'

const currentEnv = document.querySelector('meta[name="current-env"]')?.content
const apiKey = document.querySelector('meta[name="amplitude-api-key"]')?.content
const userIdMeta = document.querySelector('meta[name="amplitude-user-id"]')

if (apiKey && userIdMeta) {
  const options = {
    defaultTracking: true
  }

  if (currentEnv === 'development') {
    options.logLevel = amplitude.Types.LogLevel.Debug
  }

  amplitude.init(apiKey, userIdMeta.content, options)
}

export default amplitude
