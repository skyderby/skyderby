import { createSelector } from 'reselect'

export const selectAllSuits = state => Object.values(state.suits.byId)

export const selectSuit = (state, suitId) => {
  const { byId } = state.suits

  return byId[suitId]
}

export const createSuitSelector = suitId => state => selectSuit(state, suitId)

export const createSuitsByMakeSelector = makeId =>
  createSelector([selectAllSuits], suits =>
    suits.filter(el => el.makeId === makeId).sort((a, b) => a.name.localeCompare(b.name))
  )

export const selectUsageStats = state => state.suits.usageStats.byId
