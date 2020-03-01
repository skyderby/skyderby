import { LOAD_SUCCESS } from './actionTypes'

const initialState = null

const normalizeData = record =>
  record && {
    ...record,
    result: Number(record.result)
  }

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case LOAD_SUCCESS:
      return normalizeData(action.payload.competitionResult)
    default:
      return state
  }
}
