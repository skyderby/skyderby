export const getMinMaxAltitude = points => {
  if (points.length < 1) return null

  const altitudeValues = points.map(el => el.altitude).sort((a, b) => a - b)

  return [altitudeValues[0], altitudeValues[altitudeValues.length - 1]]
}
