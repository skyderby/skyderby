import { combineReducers } from 'redux'

import status from './status'
import competitionResult from './competitionResult'
import onlineRankingResults from './onlineRankingResults'
import bestResults from './bestResults'
import totalResults from './totalResults'

export default combineReducers({
  status,
  competitionResult,
  onlineRankingResults,
  bestResults,
  totalResults
})
