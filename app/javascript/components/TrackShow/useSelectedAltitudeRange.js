import { useState, useEffect, useRef } from 'react'

const useSelectedAltitudeRange = (initialAltitudeRange, trackAltitudeRange) => {
  const initialized = useRef()
  const [selectedAltitudeRange, setSelectedAltitudeRange] = useState(initialAltitudeRange)

  useEffect(() => {
    if (initialized.current || !trackAltitudeRange) return

    const [minAltitude, maxAltitude] = trackAltitudeRange
    const altitudeFrom = selectedAltitudeRange[0] ? selectedAltitudeRange[0] : maxAltitude
    const altitudeTo = selectedAltitudeRange[1] ? selectedAltitudeRange[1] : minAltitude

    setSelectedAltitudeRange([altitudeFrom, altitudeTo])

    initialized.current = true
  }, [selectedAltitudeRange, trackAltitudeRange])

  return [selectedAltitudeRange, setSelectedAltitudeRange]
}

export default useSelectedAltitudeRange
