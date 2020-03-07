const selectAssignedReferencePointIds = state => [
  ...new Set(
    state.eventRound.referencePointAssignments
      .map(el => el.referencePointId)
      .filter(el => el)
  )
]

const selectResults = state => state.eventRound.results

const selectSelectedResultIds = state => state.eventRound.selectedResults

export const selectReferencePoints = state => state.eventRound.referencePoints

export const selectReferencePointById = (state, id) => {
  const referencePoints = selectReferencePoints(state)

  return referencePoints.find(referencePoint => referencePoint.id === id)
}

export const selectAssignedReferencePoints = state => {
  const assignedReferencePointIds = selectAssignedReferencePointIds(state)
  const referencePoints = selectReferencePoints(state)

  return referencePoints.filter(
    ({ id }) =>
      assignedReferencePointIds.find(assignedId => assignedId === id) !== undefined
  )
}

export const selectSelectedResults = state => {
  const selectedResultIds = selectSelectedResultIds(state)
  const results = selectResults(state)

  return selectedResultIds.map(id => results.find(result => result.id === id))
}

const selectAllCoordinates = state => {
  const referencePoints = selectAssignedReferencePoints(state)
  const results = selectSelectedResults(state)

  return [
    ...referencePoints.map(el => ({
      latitude: Number(el.latitude),
      longitude: Number(el.longitude)
    })),
    ...results.reduce(
      (acc, { points }) => [
        ...acc,
        ...points.map(el => ({
          latitude: Number(el.latitude),
          longitude: Number(el.longitude)
        }))
      ],
      []
    )
  ]
}

export const selectBoundaries = state => {
  const allCoordinates = selectAllCoordinates(state)

  const latitudes = allCoordinates
    .map(el => el.latitude)
    .sort()
    .filter(el => el)

  const longitudes = allCoordinates
    .map(el => el.longitude)
    .sort()
    .filter(el => el)

  if (latitudes.length === 0 || longitudes.length === 0) return {}

  return {
    minLatitude: latitudes[0],
    maxLatitude: latitudes[latitudes.length - 1],
    minLongitude: longitudes[0],
    maxLongitude: longitudes[longitudes.length - 1]
  }
}
