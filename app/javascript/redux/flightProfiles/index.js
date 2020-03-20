import { combineReducers } from 'redux'

import tracksList from './tracksList'
import selectedTracks from './selectedTracks'
import selectedTerrainProfile from './selectedTerrainProfile'

export { selectTrack } from './tracksList'
export { toggleTrack } from './selectedTracks'
export { selectTerrainProfile } from './selectedTerrainProfile'
export * from './selectors'

export default combineReducers({ tracksList, selectedTracks, selectedTerrainProfile })
