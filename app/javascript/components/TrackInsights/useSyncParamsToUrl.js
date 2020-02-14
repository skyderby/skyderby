import { useEffect } from 'react'

const useSyncParamsToUrl = ({
  straightLine,
  selectedAltitudeRange,
  trackAltitudeRange
}) => {
  useEffect(() => {
    if (!trackAltitudeRange) return

    const [altitudeFrom, altitudeTo] = selectedAltitudeRange
    const [minAltitude, maxAltitude] = trackAltitudeRange

    const newQueryString = [
      ['f', altitudeFrom === maxAltitude ? undefined : altitudeFrom],
      ['t', altitudeTo === minAltitude ? undefined : altitudeTo],
      ['straight-line', straightLine ? straightLine : undefined]
    ]
      .filter(([_key, val]) => val !== undefined)
      .map(([key, val]) => `${key}=${val}`)
      .join('&')

    const newUrl = [window.location.pathname, newQueryString].filter(el => el).join('?')

    history.replaceState(null, '', newUrl)
  }, [straightLine, selectedAltitudeRange, trackAltitudeRange])
}

export default useSyncParamsToUrl
