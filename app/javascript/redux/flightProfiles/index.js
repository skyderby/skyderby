import { combineReducers } from 'redux'

import selectedTracks from './selectedTracks'
import selectedTerrainProfile from './selectedTerrainProfile'

export { toggleTrack } from './selectedTracks'
export { selectTerrainProfile } from './selectedTerrainProfile'
export * from './selectors'

export default combineReducers({ selectedTracks, selectedTerrainProfile })
