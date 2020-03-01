export const selectCompetitionResult = (state, trackId) => {
  const { byId } = state.tracks.results

  const data = byId[trackId] || {}

  return data.competitionResult
}

export const selectBestResults = (state, trackId) => {
  const { byId } = state.tracks.results

  const data = byId[trackId] || {}

  return data.bestResults || []
}

export const selectTotalResults = (state, trackId) => {
  const { byId } = state.tracks.results

  const data = byId[trackId] || {}

  return data.totalResults || []
}

export const selectOnlineRankingResults = (state, trackId) => {
  const { byId } = state.tracks.results

  const data = byId[trackId] || {}

  return data.onlineRankingResults || []
}
