export const selectAllTeams = state => {
  const { allIds, byId } = state.eventTeams

  return allIds.map(id => byId[id])
}

export const selectTeam = (id, state) => {
  const { byId } = state.eventTeams

  return byId[id]
}
