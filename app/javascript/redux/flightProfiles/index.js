import { combineReducers } from 'redux'

import tracksList from './tracksList'
import selectedTracks from './selectedTracks'

export { selectTrack } from './tracksList'
export { toggleTrack } from './selectedTracks'
export * from './selectors'

export default combineReducers({ tracksList, selectedTracks })
