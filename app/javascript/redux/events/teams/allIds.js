import {
  LOAD_REQUEST,
  LOAD_SUCCESS,
  LOAD_ERROR,
  TEAM_CREATED,
  TEAM_DELETED
} from './actionTypes.js'

const initialState = []

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
    case LOAD_ERROR:
      return initialState
    case LOAD_SUCCESS:
      return action.payload.map(({ id }) => id)
    case TEAM_CREATED:
      return [...state, action.payload.id]
    case TEAM_DELETED:
      return state.filter(el => el !== action.payload.id)
    default:
      return state
  }
}
