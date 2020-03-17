import { LOAD_REQUEST, LOAD_SUCCESS, LOAD_ERROR } from './actionTypes'

const initialState = null

const normalizeData = country => ({
  ...country,
  id: Number(country.id)
})

const countryReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REQUEST:
      return {
        ...state,
        status: 'loading'
      }
    case LOAD_ERROR:
      return {
        ...state,
        status: 'error'
      }
    case LOAD_SUCCESS:
      return {
        ...normalizeData(action.payload),
        status: 'loaded'
      }
    default:
      return state
  }
}

export default countryReducer
