export const getBoundaries = points => {
  const latitudes = points
    .map(el => el.latitude)
    .sort()
    .filter(el => el)

  const longitudes = points
    .map(el => el.longitude)
    .sort()
    .filter(el => el)

  if (latitudes.length === 0 || longitudes.length === 0) return null

  return {
    minLatitude: latitudes[0],
    maxLatitude: latitudes[latitudes.length - 1],
    minLongitude: longitudes[0],
    maxLongitude: longitudes[longitudes.length - 1]
  }
}
