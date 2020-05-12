import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_ERROR,
  TEAM_CREATED,
  TEAM_UPDATED,
  TEAM_DELETED
} from './actionTypes'

const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_ERROR:
      return initialState
    case LOAD_SUCCESS:
      return action.payload.reduce((acc, team) => {
        acc[team.id] = team
        return acc
      }, {})
    case TEAM_CREATED:
    case TEAM_UPDATED:
      return {
        ...state,
        [action.payload.id]: action.payload
      }
    case TEAM_DELETED:
      return Object.fromEntries(
        Object.entries(state).filter(([id]) => id !== action.payload.id)
      )
    default:
      return state
  }
}
